import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardView } from "@/components/club/dashboard-view";
import { toClientData } from "@/lib/serialize";

export default async function ClubDashboardPage({
  params,
}: {
  params: { clubId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const teamWhere = session.user.role === "ENTRENADOR"
    ? { entrenadorId: session.user.id }
    : undefined;

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    include: {
      _count: {
        select: {
          equipos: teamWhere ? { where: teamWhere } : true,
          sedes: true,
        },
      },
      equipos: {
        where: teamWhere,
        include: {
          _count: { select: { jugadores: true } },
        },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  const jugadoresCount = await db.jugador.count({
    where: { equipo: { clubId: params.clubId, ...teamWhere } },
  });

  const mensualidadesPendientes = ["SUPER_ADMIN", "CLUB_ADMIN"].includes(session.user.role)
    ? await db.mensualidad.count({
        where: {
          jugador: { equipo: { clubId: params.clubId } },
          estado: "PENDIENTE",
        },
      })
    : 0;

  const proximosEventos = await db.evento.findMany({
    where: { equipo: { clubId: params.clubId, ...teamWhere }, fecha: { gte: new Date() } },
    orderBy: { fecha: "asc" },
    take: 5,
    include: { equipo: { select: { nombre: true } } },
  });

  return (
    <DashboardView
      club={toClientData(club)}
      jugadoresCount={jugadoresCount}
      mensualidadesPendientes={mensualidadesPendientes}
      proximosEventos={toClientData(proximosEventos)}
      role={session.user.role}
    />
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CobrosView } from "@/components/cobros/cobros-view";
import { toClientData } from "@/lib/serialize";

export default async function CobrosPage({
  params,
}: {
  params: { clubId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "CLUB_ADMIN"].includes(session.user.role)) redirect("/unauthorized");

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    include: {
      equipos: {
        include: {
          jugadores: {
            where: { activo: true },
            orderBy: { nombre: "asc" },
            select: { id: true, nombre: true },
          },
        },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  const mensualidades = await db.mensualidad.findMany({
    where: { jugador: { equipo: { clubId: params.clubId } } },
    orderBy: { createdAt: "desc" },
    include: {
      jugador: {
        include: {
          equipo: { select: { id: true, nombre: true } },
          tutor: { select: { id: true, nombre: true, email: true } },
        },
      },
      pagos: true,
    },
  });

  return (
    <CobrosView
      club={toClientData(club)}
      mensualidades={toClientData(mensualidades)}
      role={session.user.role}
    />
  );
}

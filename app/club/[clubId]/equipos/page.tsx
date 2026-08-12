import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { EquiposView } from "@/components/club/equipos-view";
import { toClientData } from "@/lib/serialize";

export default async function EquiposPage({
  params,
}: {
  params: { clubId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    include: {
      equipos: {
        where: session.user.role === "ENTRENADOR" ? { entrenadorId: session.user.id } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          entrenador: { select: { id: true, nombre: true, email: true } },
          _count: { select: { jugadores: true } },
        },
      },
      admins: { select: { id: true, nombre: true } },
    },
  });

  if (!club) redirect("/unauthorized");

  const entrenadores = await db.usuario.findMany({
    where: {
      rol: "ENTRENADOR",
      activo: true,
      equiposCoach: { some: { clubId: params.clubId } },
    },
    select: { id: true, nombre: true, email: true },
  });

  return (
    <EquiposView
      club={toClientData(club)}
      entrenadores={toClientData(entrenadores)}
      role={session.user.role}
    />
  );
}

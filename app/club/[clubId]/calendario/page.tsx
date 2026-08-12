import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CalendarioView } from "@/components/calendario/calendario-view";
import { toClientData } from "@/lib/serialize";

export default async function CalendarioPage({
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
        include: {
          jugadores: { select: { id: true } },
        },
      },
      sedes: true,
    },
  });

  if (!club) redirect("/unauthorized");

  const eventos = await db.evento.findMany({
    where: {
      equipo: {
        clubId: params.clubId,
        ...(session.user.role === "ENTRENADOR" ? { entrenadorId: session.user.id } : {}),
      },
    },
    orderBy: { fecha: "asc" },
    include: {
      equipo: { select: { id: true, nombre: true } },
      sede: { select: { id: true, nombre: true, googleMapsUrl: true } },
      asistencias: {
        include: { jugador: { select: { id: true, nombre: true, dorsal: true } } },
      },
    },
  });

  return (
    <CalendarioView
      club={toClientData(club)}
      eventos={toClientData(eventos)}
      role={session.user.role}
      userId={session.user.id}
    />
  );
}

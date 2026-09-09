import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppCalendarioView } from "@/components/app/app-calendario-view";

export default async function AppCalendarioPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const jugadores = await db.jugador.findMany({
    where: {
      OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }],
    },
    select: { id: true, nombre: true, equipoId: true },
  });

  const clubIds = [...new Set(
    (await Promise.all(
      jugadores
        .filter((j: { equipoId: string | null }) => j.equipoId)
        .map(async (j: { equipoId: string | null }) => {
          const equipo = await db.equipo.findUnique({ where: { id: j.equipoId! }, select: { clubId: true } });
          return equipo?.clubId;
        })
    )).filter(Boolean) as string[]
  )];

  const eventos = await db.evento.findMany({
    where: clubIds.length
      ? { equipo: { clubId: { in: clubIds } } }
      : { id: "never" },
    orderBy: { fecha: "asc" },
    include: {
      equipo: { select: { id: true, nombre: true, clubId: true } },
      sede: { select: { id: true, nombre: true, googleMapsUrl: true } },
      asistencias: {
        where: { jugador: { OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }] } },
        include: { jugador: { select: { id: true, nombre: true } } },
      },
    },
  });

  return <AppCalendarioView eventos={eventos} jugadores={jugadores} />;
}

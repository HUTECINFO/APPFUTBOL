import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppInicioView } from "@/components/app/app-inicio-view";

export default async function AppInicioPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const jugadores = await db.jugador.findMany({
    where: {
      OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }],
    },
    include: {
      equipo: {
        include: {
          club: { select: { id: true, nombre: true } },
        },
      },
    },
  });

  const eventos = await db.evento.findMany({
    where: {
      equipo: {
        jugadores: { some: { OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }] } },
      },
      fecha: { gte: new Date() },
    },
    orderBy: { fecha: "asc" },
    take: 5,
    include: {
      equipo: { select: { id: true, nombre: true, clubId: true } },
      sede: { select: { id: true, nombre: true } },
    },
  });

  return (
    <AppInicioView
      user={session.user}
      jugadores={jugadores}
      eventos={eventos}
    />
  );
}

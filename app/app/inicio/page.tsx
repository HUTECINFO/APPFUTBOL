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

  const clubIds = [...new Set(jugadores.map((j: any) => j.equipo?.clubId).filter(Boolean))] as string[];

  const eventos = await db.evento.findMany({
    where: clubIds.length
      ? { equipo: { clubId: { in: clubIds } }, fecha: { gte: new Date() } }
      : { id: "never" },
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

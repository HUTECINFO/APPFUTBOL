import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppChatView } from "@/components/app/app-chat-view";

export default async function AppChatPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const equipos = await db.equipo.findMany({
    where: {
      OR: [
        { entrenadorId: session.user.id },
        {
          jugadores: {
            some: { OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }] },
          },
        },
      ],
    },
    select: { id: true, nombre: true, clubId: true },
    orderBy: { nombre: "asc" },
  });

  const mensajesIniciales = equipos.length
    ? await db.mensajeChat.findMany({
        where: { chat: { equipoId: equipos[0].id } },
        orderBy: { createdAt: "asc" },
        take: 100,
        include: { autor: { select: { id: true, nombre: true, rol: true } } },
      })
    : [];

  return (
    <AppChatView
      equipos={equipos}
      mensajesIniciales={mensajesIniciales}
      userId={session.user.id}
      role={session.user.role}
    />
  );
}

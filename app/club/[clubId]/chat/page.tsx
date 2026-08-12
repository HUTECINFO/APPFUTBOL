import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatView } from "@/components/chat/chat-view";
import { toClientData } from "@/lib/serialize";

export default async function ChatPage({
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
          jugadores: { select: { id: true, nombre: true } },
        },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  const primerEquipoId = club.equipos[0]?.id;
  const mensajes = primerEquipoId
    ? await db.mensajeChat.findMany({
        where: { chat: { equipoId: primerEquipoId } },
        orderBy: { createdAt: "asc" },
        take: 100,
        include: {
          autor: { select: { id: true, nombre: true, rol: true } },
        },
      })
    : [];

  return (
    <ChatView
      club={toClientData(club)}
      mensajesIniciales={toClientData(mensajes)}
      userId={session.user.id}
      userName={session.user.name || ""}
      role={session.user.role}
    />
  );
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canAccessTeam } from "@/lib/authorization";

const schema = z.object({
  contenido: z.string().min(1).max(2000),
});

export async function GET(
  req: Request,
  { params }: { params: { clubId: string; equipoId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!(await canAccessTeam(actorFromSession(session), params.clubId, params.equipoId))) {
    return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
  }

  const mensajes = await db.mensajeChat.findMany({
    where: { chat: { equipoId: params.equipoId } },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { autor: { select: { id: true, nombre: true, rol: true } } },
  });

  return NextResponse.json(mensajes);
}

export async function POST(
  req: Request,
  { params }: { params: { clubId: string; equipoId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!(await canAccessTeam(actorFromSession(session), params.clubId, params.equipoId))) {
    return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    let chat = await db.chat.findFirst({
      where: { equipoId: params.equipoId, tipo: "equipo" },
    });

    if (!chat) {
      chat = await db.chat.create({
        data: {
          equipoId: params.equipoId,
          tipo: "equipo",
          nombre: "Chat de equipo",
        },
      });
    }

    const mensaje = await db.mensajeChat.create({
      data: {
        chatId: chat.id,
        autorId: session.user.id,
        contenido: data.contenido,
      },
      include: { autor: { select: { id: true, nombre: true, rol: true } } },
    });

    return NextResponse.json(mensaje, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al enviar mensaje" }, { status: 500 });
  }
}

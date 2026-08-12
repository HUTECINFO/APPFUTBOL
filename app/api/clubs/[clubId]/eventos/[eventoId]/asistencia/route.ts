import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canAccessTeam, canManageTeam } from "@/lib/authorization";

const schema = z.object({
  jugadorId: z.string(),
  estado: z.enum(["PENDIENTE", "CONFIRMADO", "RECHAZADO", "ASISTIO", "NO_ASISTIO"]),
});

export async function POST(
  req: Request,
  { params }: { params: { clubId: string; eventoId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const evento = await db.evento.findFirst({
      where: { id: params.eventoId, equipo: { clubId: params.clubId } },
      select: { id: true, equipoId: true },
    });

    if (!evento) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

    const actor = actorFromSession(session);
    if (!(await canAccessTeam(actor, params.clubId, evento.equipoId))) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const canManage = await canManageTeam(actor, params.clubId, evento.equipoId);
    const jugador = await db.jugador.findFirst({
      where: {
        id: data.jugadorId,
        equipoId: evento.equipoId,
        ...(canManage
          ? {}
          : {
              OR: [
                { usuarioId: session.user.id },
                { tutorId: session.user.id },
              ],
            }),
      },
      select: { id: true },
    });

    if (!jugador) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    if (!canManage && ["ASISTIO", "NO_ASISTIO"].includes(data.estado)) {
      return NextResponse.json({ error: "Solo el staff puede registrar asistencia final" }, { status: 403 });
    }

    const asistencia = await db.asistencia.upsert({
      where: {
        eventoId_jugadorId: {
          eventoId: params.eventoId,
          jugadorId: data.jugadorId,
        },
      },
      update: {
        estado: data.estado,
        confirmadoPor: session.user.id,
      },
      create: {
        eventoId: params.eventoId,
        jugadorId: data.jugadorId,
        estado: data.estado,
        confirmadoPor: session.user.id,
      },
    });

    return NextResponse.json(asistencia);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al confirmar" }, { status: 500 });
  }
}

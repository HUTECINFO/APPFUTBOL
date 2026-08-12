import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canAccessClub, canManageTeam } from "@/lib/authorization";

const schema = z.object({
  titulo: z.string().min(1),
  tipo: z.enum(["ENTRENAMIENTO", "PARTIDO", "TORNEO"]),
  fecha: z.string().datetime(),
  equipoId: z.string(),
  sedeId: z.string().optional(),
  descripcion: z.string().optional(),
  rival: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!(await canAccessClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "Club no encontrado" }, { status: 404 });
  }

  const eventos = await db.evento.findMany({
    where: {
      equipo: {
        clubId: params.clubId,
        ...(session.user.role === "ENTRENADOR"
          ? { entrenadorId: session.user.id }
          : ["JUGADOR", "TUTOR"].includes(session.user.role)
            ? {
                jugadores: {
                  some: {
                    OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }],
                  },
                },
              }
            : {}),
      },
    },
    orderBy: { fecha: "asc" },
    include: {
      equipo: { select: { id: true, nombre: true } },
      sede: { select: { id: true, nombre: true } },
      asistencias: {
        include: { jugador: { select: { id: true, nombre: true } } },
      },
    },
  });

  return NextResponse.json(eventos);
}

export async function POST(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);
    if (!(await canManageTeam(actorFromSession(session), params.clubId, data.equipoId))) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }
    if (data.sedeId) {
      const sede = await db.sede.findFirst({
        where: { id: data.sedeId, clubId: params.clubId },
        select: { id: true },
      });
      if (!sede) return NextResponse.json({ error: "Sede no encontrada" }, { status: 404 });
    }

    const evento = await db.evento.create({
      data: {
        titulo: data.titulo,
        tipo: data.tipo,
        fecha: new Date(data.fecha),
        equipoId: data.equipoId,
        sedeId: data.sedeId || null,
        descripcion: data.descripcion,
        rival: data.rival,
      },
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear evento" }, { status: 500 });
  }
}

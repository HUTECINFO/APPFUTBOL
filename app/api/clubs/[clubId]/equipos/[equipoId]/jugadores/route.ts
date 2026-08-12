import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canAccessTeam, canManageTeam } from "@/lib/authorization";

const schema = z.object({
  nombre: z.string().min(2),
  apodo: z.string().optional(),
  posicion: z.enum(["Portero", "Defensa", "Mediocampista", "Delantero"]),
  dorsal: z.number().int().min(1).max(99).optional(),
  fechaNacimiento: z.union([z.string().datetime(), z.string().date()]),
  tutorId: z.string().optional(),
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

  const jugadores = await db.jugador.findMany({
    where: { equipoId: params.equipoId },
    orderBy: { dorsal: "asc" },
    include: {
      tutor: { select: { id: true, nombre: true, email: true, telefono: true } },
    },
  });

  return NextResponse.json(jugadores);
}

export async function POST(
  req: Request,
  { params }: { params: { clubId: string; equipoId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageTeam(actorFromSession(session), params.clubId, params.equipoId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const jugador = await db.jugador.create({
      data: {
        nombre: data.nombre,
        apodo: data.apodo,
        posicion: data.posicion,
        dorsal: data.dorsal,
        fechaNacimiento: new Date(data.fechaNacimiento),
        tutorId: data.tutorId || null,
        equipoId: params.equipoId,
      },
    });

    return NextResponse.json(jugador, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear jugador" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canManageClub } from "@/lib/authorization";

const schema = z.object({
  jugadorId: z.string(),
  periodo: z.string().regex(/^\d{4}-\d{2}$/),
  monto: z.number().positive(),
});

export async function GET(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "Club no encontrado" }, { status: 404 });
  }

  const mensualidades = await db.mensualidad.findMany({
    where: { jugador: { equipo: { clubId: params.clubId } } },
    orderBy: { createdAt: "desc" },
    include: {
      jugador: { include: { equipo: { select: { id: true, nombre: true } } } },
      pagos: true,
    },
  });

  return NextResponse.json(mensualidades);
}

export async function POST(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const jugador = await db.jugador.findFirst({
      where: { id: data.jugadorId, equipo: { clubId: params.clubId } },
    });

    if (!jugador) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });

    const mensualidad = await db.mensualidad.create({
      data: {
        jugadorId: data.jugadorId,
        periodo: data.periodo,
        monto: data.monto,
        estado: "PENDIENTE",
      },
    });

    return NextResponse.json(mensualidad, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear mensualidad" }, { status: 500 });
  }
}

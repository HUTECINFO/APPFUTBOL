import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canAccessTeam, canManageTeam } from "@/lib/authorization";

const schema = z.object({
  nombre: z.string().min(1),
  esquema: z.record(
    z.object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
  ),
  esTitular: z.boolean().default(false),
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

  const formaciones = await db.formacion.findMany({
    where: { equipoId: params.equipoId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(formaciones);
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

    if (data.esTitular) {
      await db.formacion.updateMany({
        where: { equipoId: params.equipoId },
        data: { esTitular: false },
      });
    }

    const formacion = await db.formacion.create({
      data: {
        nombre: data.nombre,
        esquema: data.esquema,
        esTitular: data.esTitular,
        equipoId: params.equipoId,
      },
    });

    return NextResponse.json(formacion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al guardar formación" }, { status: 500 });
  }
}

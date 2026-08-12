import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canAccessClub, canManageClub } from "@/lib/authorization";

const schema = z.object({
  nombre: z.string().min(2),
  categoria: z.string().min(1),
  genero: z.enum(["Varonil", "Femenil", "Mixto"]),
  entrenadorId: z.string().optional(),
  cupoMaximo: z.number().int().min(1).max(500).optional(),
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

  const equipos = await db.equipo.findMany({
    where: {
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
    orderBy: { createdAt: "desc" },
    include: {
      entrenador: { select: { id: true, nombre: true } },
      _count: { select: { jugadores: true } },
    },
  });

  return NextResponse.json(equipos);
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

    const equipo = await db.equipo.create({
      data: {
        ...data,
        clubId: params.clubId,
      },
    });

    return NextResponse.json(equipo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear equipo" }, { status: 500 });
  }
}

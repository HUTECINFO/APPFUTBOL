import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { z } from "zod";

const updateClubSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  colorPrimario: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  colorSecundario: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  feeMensual: z.number().min(0).max(1_000_000).optional(),
  porcentajePlataforma: z.number().min(0).max(100).optional(),
  activo: z.boolean().optional(),
}).strict();

export async function GET(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "Club no encontrado" }, { status: 404 });
  }

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    include: {
      equipos: true,
      sedes: true,
      admins: { select: { id: true, nombre: true, email: true } },
    },
  });

  if (!club) return NextResponse.json({ error: "Club no encontrado" }, { status: 404 });

  return NextResponse.json(club);
}

export async function PATCH(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = updateClubSchema.parse(await req.json());
    const club = await db.club.update({
      where: { id: params.clubId },
      data: { ...body, logoUrl: body.logoUrl || null },
    });
    return NextResponse.json(club);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

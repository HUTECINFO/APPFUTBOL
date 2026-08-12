import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canManageClub } from "@/lib/authorization";

const patchSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  direccion: z.string().min(1).max(500).optional(),
  googleMapsUrl: z
    .string()
    .trim()
    .url()
    .max(1000)
    .refine((url) => /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(url), {
      message: "Debe ser un link válido de Google Maps",
    })
    .optional()
    .or(z.literal("")),
});

export async function PATCH(
  req: Request,
  { params }: { params: { clubId: string; sedeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const sede = await db.sede.findFirst({
      where: { id: params.sedeId, clubId: params.clubId },
    });

    if (!sede) return NextResponse.json({ error: "Sede no encontrada" }, { status: 404 });

    const body = await req.json();
    const data = patchSchema.parse(body);

    const updated = await db.sede.update({
      where: { id: params.sedeId },
      data: {
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.direccion !== undefined ? { direccion: data.direccion } : {}),
        ...(data.googleMapsUrl !== undefined ? { googleMapsUrl: data.googleMapsUrl || null } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar sede" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { clubId: string; sedeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const sede = await db.sede.findFirst({
      where: { id: params.sedeId, clubId: params.clubId },
    });

    if (!sede) return NextResponse.json({ error: "Sede no encontrada" }, { status: 404 });

    await db.sede.delete({
      where: { id: params.sedeId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al eliminar sede" }, { status: 500 });
  }
}

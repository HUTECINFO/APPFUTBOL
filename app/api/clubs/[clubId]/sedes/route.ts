import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canManageClub } from "@/lib/authorization";

const schema = z.object({
  nombre: z.string().min(1).max(100),
  direccion: z.string().min(1).max(500),
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

    const sede = await db.sede.create({
      data: {
        clubId: params.clubId,
        nombre: data.nombre,
        direccion: data.direccion,
        googleMapsUrl: data.googleMapsUrl || null,
      },
    });

    return NextResponse.json(sede, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear sede" }, { status: 500 });
  }
}

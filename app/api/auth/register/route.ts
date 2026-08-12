import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  clubNombre: z.string().trim().min(2).max(120),
  nombre: z.string().trim().min(2).max(120),
  email: z.string().email(),
  telefono: z.string().trim().max(30).optional(),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await db.usuario.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    const slug = data.clubNombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

    const hashed = await bcrypt.hash(data.password, 12);

    const user = await db.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email.toLowerCase(),
        telefono: data.telefono,
        password: hashed,
        rol: "CLUB_ADMIN",
        clubesAdmin: {
          create: {
            nombre: data.clubNombre,
            slug: uniqueSlug,
          },
        },
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al registrar" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAccountActivationToken } from "@/lib/account-activation";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
});

export async function POST(req: Request) {
  try {
    const { token, password } = schema.parse(await req.json());
    const payload = verifyAccountActivationToken(token);
    if (!payload) {
      return NextResponse.json({ error: "El enlace es inválido o ya expiró" }, { status: 400 });
    }

    const user = await db.usuario.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, password: true, activo: true },
    });

    if (!user || user.email.toLowerCase() !== payload.email) {
      return NextResponse.json({ error: "La cuenta ya no está disponible" }, { status: 404 });
    }
    if (user.password && payload.purpose !== "reset") {
      return NextResponse.json(
        { error: "La cuenta ya fue activada. Inicia sesión con tu correo." },
        { status: 409 }
      );
    }

    await db.usuario.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 12), activo: true },
    });

    return NextResponse.json({ ok: true, email: user.email });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo activar la cuenta" }, { status: 500 });
  }
}

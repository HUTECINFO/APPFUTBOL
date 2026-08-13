import { NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { EVENTO_TOUR } from "@/lib/evento-tour";

const schema = z.object({
  solicitudId: z.string().min(1),
  sessionId: z.string().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
});

/** Permite al tutor crear la contraseña de su acceso justo después de pagar. */
export async function POST(req: Request) {
  try {
    const { solicitudId, sessionId, password } = schema.parse(await req.json());

    const solicitud = await db.solicitudInscripcion.findFirst({
      where: { id: solicitudId, club: { slug: EVENTO_TOUR.clubSlug } },
      select: { id: true, emailTutor: true, estado: true, jugadorCreadoId: true },
    });

    if (!solicitud || solicitud.estado !== "APROBADA" || !solicitud.jugadorCreadoId) {
      return NextResponse.json({ error: "Pago no confirmado para esta solicitud" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      if (!sessionId) {
        return NextResponse.json({ error: "Falta la sesión de pago" }, { status: 400 });
      }
      const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
      const checkout = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        checkout.payment_status !== "paid" ||
        checkout.metadata?.solicitudId !== solicitud.id
      ) {
        return NextResponse.json({ error: "Sesión de pago inválida" }, { status: 400 });
      }
    }

    const tutor = await db.usuario.findUnique({
      where: { email: solicitud.emailTutor },
      select: { id: true, password: true },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    }
    if (tutor.password) {
      return NextResponse.json(
        { error: "Esta cuenta ya tiene contraseña. Inicia sesión con tu correo." },
        { status: 400 }
      );
    }

    await db.usuario.update({
      where: { id: tutor.id },
      data: { password: await bcrypt.hash(password, 10), activo: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo crear el acceso" }, { status: 500 });
  }
}

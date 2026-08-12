import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ mensualidadId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Los pagos con tarjeta aún no están configurados" }, { status: 503 });
  }

  try {
    const { mensualidadId } = schema.parse(await req.json());
    const mensualidad = await db.mensualidad.findFirst({
      where: {
        id: mensualidadId,
        estado: { in: ["PENDIENTE", "VENCIDO"] },
        jugador: {
          OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }],
        },
      },
      include: {
        jugador: {
          include: {
            equipo: { include: { club: { select: { nombre: true } } } },
          },
        },
      },
    });

    if (!mensualidad) {
      return NextResponse.json({ error: "Mensualidad no encontrada" }, { status: 404 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
    const origin = new URL(req.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: mensualidad.id,
      customer_email: session.user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: Math.round(Number(mensualidad.monto) * 100),
            product_data: {
              name: `Mensualidad ${mensualidad.periodo}`,
              description: `${mensualidad.jugador.nombre} · ${mensualidad.jugador.equipo.nombre} · ${mensualidad.jugador.equipo.club.nombre}`,
            },
          },
        },
      ],
      payment_intent_data: {
        metadata: { mensualidadId: mensualidad.id },
        receipt_email: session.user.email || undefined,
      },
      metadata: { mensualidadId: mensualidad.id },
      success_url: `${origin}/app/pagos?resultado=exitoso`,
      cancel_url: `${origin}/app/pagos?resultado=cancelado`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Solicitud de pago inválida" }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}

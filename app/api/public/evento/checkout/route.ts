import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { db } from "@/lib/db";
import { EVENTO_TOUR } from "@/lib/evento-tour";

const schema = z.object({ solicitudId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { solicitudId } = schema.parse(await req.json());

    const solicitud = await db.solicitudInscripcion.findFirst({
      where: { id: solicitudId, club: { slug: EVENTO_TOUR.clubSlug } },
      include: { equipo: { select: { nombre: true } } },
    });

    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    if (solicitud.jugadorCreadoId) {
      return NextResponse.json({ error: "Esta solicitud ya fue pagada" }, { status: 400 });
    }
    if (solicitud.estado === "RECHAZADA") {
      return NextResponse.json({ error: "La solicitud fue rechazada" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      // Modo prueba local: sin Stripe se usa la página de pago simulado.
      return NextResponse.json({
        url: `${origin}/inscripcion/${EVENTO_TOUR.clubSlug}/pago?solicitud=${solicitud.id}`,
        modo: "prueba",
      });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
    const priceId = process.env.STRIPE_GOALKEEPER_TOUR_PRICE_ID;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: solicitud.id,
      customer_email: solicitud.emailTutor,
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: EVENTO_TOUR.moneda,
                unit_amount: EVENTO_TOUR.precioUsd * 100,
                product_data: {
                  name: `${EVENTO_TOUR.nombre} · ${solicitud.equipo?.nombre || "Sede"}`,
                  description: `Inscripción de portero: ${solicitud.nombreJugador}`,
                },
              },
            },
      ],
      payment_intent_data: {
        metadata: { solicitudId: solicitud.id },
        receipt_email: solicitud.emailTutor,
      },
      metadata: { solicitudId: solicitud.id },
      success_url: `${origin}/inscripcion/${EVENTO_TOUR.clubSlug}/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/inscripcion/${EVENTO_TOUR.clubSlug}/confirmacion?cancelado=1&solicitud=${solicitud.id}`,
    });

    return NextResponse.json({ url: checkout.url, modo: "stripe" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Solicitud de pago inválida" }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}

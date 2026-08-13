import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { confirmarPagoEvento } from "@/lib/evento-inscripcion";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
      return NextResponse.json({ error: "Webhook de Stripe no configurado" }, { status: 503 });
    }
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    await db.webhookLog.create({
      data: {
        proveedor: "stripe",
        evento: event.type,
        payload: event as any,
        headers: { signature },
      },
    });

    if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "payment_intent.succeeded" ||
      event.type === "checkout.session.completed"
    ) {
      const payment = event.data.object as any;
      const solicitudId = payment.metadata?.solicitudId || payment.client_reference_id;

      if (solicitudId && (event.type !== "checkout.session.completed" || payment.payment_status === "paid")) {
        const referencia = payment.payment_intent || payment.id;
        try {
          await confirmarPagoEvento({
            solicitudId,
            metodoPago: "Stripe",
            referenciaPago: String(referencia),
            montoPagado: Number(payment.amount_total ?? payment.amount_received ?? 35000) / 100,
          });
        } catch (err) {
          console.error("Error confirmando pago del evento", err);
        }
        return NextResponse.json({ received: true });
      }

      const mensualidadId = payment.metadata?.mensualidadId;

      // Las mensualidades se confirman con los eventos de pago originales;
      // checkout.session.completed solo aplica al flujo del evento (solicitudId).
      if (mensualidadId && event.type !== "checkout.session.completed") {
        const mensualidad = await db.mensualidad.findUnique({ where: { id: mensualidadId } });
        const pagoExistente = await db.pago.findFirst({
          where: { proveedor: "stripe", proveedorId: payment.id },
        });

        if (mensualidad && !pagoExistente) {
          await db.$transaction([
            db.mensualidad.update({
              where: { id: mensualidadId },
              data: {
                estado: "PAGADO",
                fechaPago: new Date(),
                metodoPago: "Stripe",
                referenciaPago: payment.id,
              },
            }),
            db.pago.create({
              data: {
                mensualidadId,
                monto: mensualidad.monto,
                metodoPago: "Stripe",
                proveedor: "stripe",
                proveedorId: payment.id,
              },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

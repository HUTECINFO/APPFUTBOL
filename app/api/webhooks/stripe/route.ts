import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    if (event.type === "invoice.payment_succeeded" || event.type === "payment_intent.succeeded") {
      const payment = event.data.object as any;
      const mensualidadId = payment.metadata?.mensualidadId;

      if (mensualidadId) {
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

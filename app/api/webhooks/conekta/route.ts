import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "crypto";

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const digest = req.headers.get("digest") || "";
    const publicKey = process.env.CONEKTA_WEBHOOK_PUBLIC_KEY?.replace(/\\n/g, "\n");

    if (!publicKey) {
      return NextResponse.json({ error: "Webhook de Conekta no configurado" }, { status: 503 });
    }

    const valid = Boolean(digest) && verify(
      "RSA-SHA256",
      Buffer.from(payload, "utf8"),
      publicKey,
      Buffer.from(digest, "base64")
    );

    if (!valid) return NextResponse.json({ error: "Firma inválida" }, { status: 401 });

    const body = JSON.parse(payload);

    await db.webhookLog.create({
      data: {
        proveedor: "conekta",
        evento: body.type || "charge.paid",
        payload: body,
        headers: Object.fromEntries(req.headers.entries()),
      },
    });

    if (body.type === "charge.paid" || body.type === "order.paid") {
      const mensualidadId = body.data?.object?.metadata?.mensualidadId;
      const reference = body.data?.object?.id;

      if (mensualidadId) {
        const mensualidad = await db.mensualidad.findUnique({ where: { id: mensualidadId } });
        const pagoExistente = reference
          ? await db.pago.findFirst({ where: { proveedor: "conekta", proveedorId: reference } })
          : null;

        if (mensualidad && !pagoExistente) {
          await db.$transaction([
            db.mensualidad.update({
              where: { id: mensualidadId },
              data: {
                estado: "PAGADO",
                fechaPago: new Date(),
                metodoPago: "Conekta",
                referenciaPago: reference,
              },
            }),
            db.pago.create({
              data: {
                mensualidadId,
                monto: mensualidad.monto,
                metodoPago: "Conekta",
                proveedor: "conekta",
                proveedorId: reference,
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

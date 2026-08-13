import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { confirmarPagoEvento } from "@/lib/evento-inscripcion";

const schema = z.object({ solicitudId: z.string().min(1) });

/**
 * Pago simulado para desarrollo: solo disponible cuando Stripe no está configurado.
 * En producción la confirmación llega por el webhook o la página de confirmación.
 */
export async function POST(req: Request) {
  if (process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "El pago de prueba está deshabilitado cuando Stripe está configurado" },
      { status: 403 }
    );
  }

  try {
    const { solicitudId } = schema.parse(await req.json());
    const resultado = await confirmarPagoEvento({
      solicitudId,
      metodoPago: "Tarjeta (prueba)",
      referenciaPago: `test_${randomUUID()}`,
    });
    return NextResponse.json(resultado);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "No se pudo confirmar el pago" }, { status: 500 });
  }
}

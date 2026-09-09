import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { requestOrigin } from "@/lib/request-origin";

/**
 * Creates a one-time Stripe Checkout link for a club administrator to send
 * to the tutor. The tutor does not need to be logged in to pay this link.
 */
export async function POST(
  req: Request,
  props: { params: Promise<{ clubId: string; mensualidadId: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Los pagos con tarjeta aún no están configurados" }, { status: 503 });
  }

  try {
    const mensualidad = await db.mensualidad.findFirst({
      where: {
        id: params.mensualidadId,
        estado: { in: ["PENDIENTE", "VENCIDO"] },
        jugador: { equipo: { clubId: params.clubId } },
      },
      include: {
        jugador: {
          include: {
            tutor: { select: { email: true } },
            equipo: { include: { club: { select: { nombre: true, porcentajePlataforma: true } } } },
          },
        },
      },
    });

    if (!mensualidad) {
      return NextResponse.json({ error: "Mensualidad no encontrada o ya pagada" }, { status: 404 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
    const origin = requestOrigin(req);
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: mensualidad.id,
      customer_email: mensualidad.jugador.tutor?.email || undefined,
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
        metadata: {
          mensualidadId: mensualidad.id,
          clubId: params.clubId,
          montoMensualidadMxn: String(mensualidad.monto),
          porcentajePlataforma: String(mensualidad.jugador.equipo.club.porcentajePlataforma ?? 0),
        },
        receipt_email: mensualidad.jugador.tutor?.email || undefined,
      },
      metadata: {
        mensualidadId: mensualidad.id,
        clubId: params.clubId,
        montoMensualidadMxn: String(mensualidad.monto),
        porcentajePlataforma: String(mensualidad.jugador.equipo.club.porcentajePlataforma ?? 0),
      },
      success_url: `${origin}/club/${params.clubId}/cobros?pago=exitoso`,
      cancel_url: `${origin}/club/${params.clubId}/cobros?pago=cancelado`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: any) {
    console.error("Error creando checkout de mensualidad", error);
    return NextResponse.json({ error: "No se pudo generar el link de pago" }, { status: 500 });
  }
}

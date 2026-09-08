import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { clubSubscriptionPrice, getClubSubscription, getOrCreateClubCustomer, stripeClient } from "@/lib/stripe-subscription";
import { requestOrigin } from "@/lib/request-origin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { clubId } = await params;
  if (!(await canManageClub(actorFromSession(session), clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const club = await db.club.findUnique({
      where: { id: clubId },
      select: { id: true, nombre: true },
    });
    if (!club) return NextResponse.json({ error: "Club no encontrado" }, { status: 404 });

    const stripe = stripeClient();
    const current = await getClubSubscription(stripe, clubId);
    if (current.subscription && ["active", "trialing", "past_due"].includes(current.subscription.status)) {
      return NextResponse.json(
        { error: "El club ya tiene una suscripción. Adminístrala desde el portal de facturación." },
        { status: 409 }
      );
    }

    const [price, customer] = await Promise.all([
      clubSubscriptionPrice(stripe),
      getOrCreateClubCustomer({
        stripe,
        clubId,
        clubName: club.nombre,
        email: session.user.email,
      }),
    ]);
    const origin = requestOrigin(req);
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { app: "club-one", kind: "club_subscription", clubId },
      subscription_data: { metadata: { app: "club-one", clubId } },
      success_url: `${origin}/club/${clubId}/configuracion?suscripcion=success`,
      cancel_url: `${origin}/club/${clubId}/configuracion?suscripcion=cancelled`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "No se pudo iniciar la suscripción" },
      { status: 500 }
    );
  }
}

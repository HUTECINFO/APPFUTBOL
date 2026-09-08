import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { CLUB_SUBSCRIPTION_AMOUNT_MXN, getClubSubscription, stripeClient } from "@/lib/stripe-subscription";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { clubId } = await params;
  if (!(await canManageClub(actorFromSession(session), clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { customer, subscription } = await getClubSubscription(stripeClient(), clubId);
    return NextResponse.json({
      configured: true,
      amountMxn: CLUB_SUBSCRIPTION_AMOUNT_MXN,
      customer: Boolean(customer),
      status: subscription?.status ?? "inactive",
      currentPeriodEnd: subscription ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { configured: false, error: error.message || "No se pudo consultar la suscripción" },
      { status: 503 }
    );
  }
}

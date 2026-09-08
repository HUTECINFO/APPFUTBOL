import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { findClubCustomer, stripeClient } from "@/lib/stripe-subscription";
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
    const stripe = stripeClient();
    const customer = await findClubCustomer(stripe, clubId);
    if (!customer) return NextResponse.json({ error: "El club todavía no tiene una cuenta de facturación" }, { status: 404 });
    const origin = requestOrigin(req);
    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/club/${clubId}/configuracion`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "No se pudo abrir el portal de facturación" },
      { status: 500 }
    );
  }
}

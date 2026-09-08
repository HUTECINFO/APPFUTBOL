import Stripe from "stripe";

export const CLUB_SUBSCRIPTION_LOOKUP_KEY = "club_one_monthly_1200_mxn";
export const CLUB_SUBSCRIPTION_AMOUNT_MXN = 1200;

export function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe no está configurado");
  return new Stripe(secretKey, { apiVersion: "2023-10-16" });
}

export async function clubSubscriptionPrice(stripe = stripeClient()) {
  const configuredPriceId = process.env.STRIPE_CLUB_SUBSCRIPTION_PRICE_ID;
  if (configuredPriceId) {
    const configured = await stripe.prices.retrieve(configuredPriceId);
    if (
      configured.active &&
      configured.currency === "mxn" &&
      configured.unit_amount === CLUB_SUBSCRIPTION_AMOUNT_MXN * 100 &&
      configured.recurring?.interval === "month"
    ) {
      return configured;
    }
    throw new Error("El precio configurado para la suscripción de Club One no es válido");
  }

  const prices = await stripe.prices.list({
    active: true,
    lookup_keys: [CLUB_SUBSCRIPTION_LOOKUP_KEY],
    limit: 1,
  });
  const price = prices.data[0];
  if (!price) throw new Error("No se encontró el plan mensual de Club One en Stripe");
  return price;
}

function stripeSearchValue(value: string) {
  return value.replace(/[\\']/g, "");
}

export async function findClubCustomer(stripe: Stripe, clubId: string) {
  const result = await stripe.customers.search({
    query: `metadata['clubId']:'${stripeSearchValue(clubId)}'`,
    limit: 1,
  });
  return result.data[0] ?? null;
}

export async function getOrCreateClubCustomer(params: {
  stripe: Stripe;
  clubId: string;
  clubName: string;
  email?: string | null;
}) {
  const existing = await findClubCustomer(params.stripe, params.clubId);
  if (existing) return existing;

  return params.stripe.customers.create({
    name: params.clubName,
    email: params.email || undefined,
    metadata: { app: "club-one", clubId: params.clubId },
  });
}

export async function getClubSubscription(stripe: Stripe, clubId: string) {
  const customer = await findClubCustomer(stripe, clubId);
  if (!customer) return { customer: null, subscription: null };

  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 20,
  });
  const priority = ["active", "trialing", "past_due", "incomplete", "unpaid", "paused", "canceled"];
  const subscription = subscriptions.data
    .filter((item) => item.metadata.clubId === clubId)
    .sort((a, b) => priority.indexOf(a.status) - priority.indexOf(b.status))[0] ?? null;

  return { customer, subscription };
}

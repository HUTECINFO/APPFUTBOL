import { createHmac, timingSafeEqual } from "crypto";

const ACTIVATION_TTL_SECONDS = 7 * 24 * 60 * 60;

interface ActivationPayload {
  userId: string;
  email: string;
  exp: number;
}

function secret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("NEXTAUTH_SECRET no está configurado");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createAccountActivationToken(userId: string, email: string) {
  const payload: ActivationPayload = {
    userId,
    email: email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + ACTIVATION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAccountActivationToken(token: string): ActivationPayload | null {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;

  const expected = Buffer.from(sign(encoded));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ActivationPayload;
    if (!payload.userId || !payload.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

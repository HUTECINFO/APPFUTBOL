import { timingSafeEqual } from "crypto";

export function hasValidAutomationSecret(req: Request) {
  const configured = process.env.N8N_WEBHOOK_SECRET;
  if (!configured) return false;

  const authorization = req.headers.get("authorization") || "";
  const received = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : req.headers.get("x-webhook-secret") || "";

  const expectedBuffer = Buffer.from(configured);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

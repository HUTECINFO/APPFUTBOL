/** Returns the public origin used in links and payment redirects. */
export function requestOrigin(req: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  const requestUrl = new URL(req.url);
  const host = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || req.headers.get("host");
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (process.env.NODE_ENV !== "production" && host) {
    return `${forwardedProto || requestUrl.protocol.replace(":", "")}://${host}`;
  }
  if (configured) {
    try {
      const configuredUrl = new URL(configured);
      const isLocalConfigured = ["localhost", "127.0.0.1", "::1"].includes(configuredUrl.hostname);
      if (!isLocalConfigured || !host) return configuredUrl.origin;
    } catch { /* use request host */ }
  }
  if (host) return `${forwardedProto || requestUrl.protocol.replace(":", "")}://${host}`;
  return requestUrl.origin;
}

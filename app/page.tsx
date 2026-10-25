import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { NATIVE_APP_USER_AGENT } from "@/lib/native";

export default async function HomePage() {
  // La app nativa (Capacitor) arranca en la raíz; ahí no mostramos la landing.
  const userAgent = (await headers()).get("user-agent") ?? "";
  if (userAgent.includes(NATIVE_APP_USER_AGENT)) redirect("/app/inicio");

  return <LandingPage />;
}

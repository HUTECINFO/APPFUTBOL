import type { Metadata, Viewport } from "next";
import { Sora, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CLUB_ONE_FAVICON_URL } from "@/lib/brand-assets";
import { CookieConsent } from "@/components/legal/cookie-consent";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Club One | Gestión para clubes y academias de fútbol",
  description:
    "Club One conecta la operación de clubes, academias, entrenadores y jugadores de fútbol en un solo lugar.",
  keywords: ["gestión deportiva", "club de fútbol", "academia de fútbol", "entrenadores", "jugadores", "Club One"],
  authors: [{ name: "Club One" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: CLUB_ONE_FAVICON_URL,
    apple: CLUB_ONE_FAVICON_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0E14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX" suppressHydrationWarning className={`${sora.variable} ${oswald.variable}`}>
      <body className="min-h-screen">
        <a href="#contenido-principal" className="skip-link">Saltar al contenido</a>
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}

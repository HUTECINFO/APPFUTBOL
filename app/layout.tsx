import type { Metadata, Viewport } from "next";
import { Sora, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

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
  title: "Club One presenta USA Goalkeeper Tour 2026",
  description:
    "Club One presenta el USA Goalkeeper Tour 2026: cuatro clínicas de élite para porteros en Texas.",
  keywords: ["porteros", "goalkeeper", "fútbol", "Texas", "clínica", "Club One"],
  authors: [{ name: "Club One" }],
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
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
      </body>
    </html>
  );
}

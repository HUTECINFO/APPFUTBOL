import type { CapacitorConfig } from "@capacitor/cli";
import { existsSync, readFileSync } from "fs";

/**
 * La app nativa (iOS / Android) es un contenedor de Capacitor que carga la
 * plataforma Next.js desplegada. Next usa API routes, NextAuth y webhooks, así
 * que no se puede exportar como sitio estático.
 *
 * La URL del servidor se toma de `CAPACITOR_SERVER_URL` (variable de entorno o
 * archivo `.env.mobile`). Ver docs/APP_MOVIL.md.
 */
function readMobileEnv(): Record<string, string> {
  if (!existsSync(".env.mobile")) return {};
  return Object.fromEntries(
    readFileSync(".env.mobile", "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...rest] = line.split("=");
        return [key.trim(), rest.join("=").trim().replace(/^["']|["']$/g, "")];
      })
  );
}

const mobileEnv = readMobileEnv();
const serverUrl = (process.env.CAPACITOR_SERVER_URL || mobileEnv.CAPACITOR_SERVER_URL || "").replace(/\/$/, "");

if (!serverUrl) {
  throw new Error(
    "Falta CAPACITOR_SERVER_URL. Define la URL pública de producción (https://...) en .env.mobile antes de sincronizar las apps nativas."
  );
}

const isDevServer = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "mx.hutec.clubone",
  appName: "Club One",
  webDir: "mobile/www",
  server: {
    // Debe ser la raíz: Capacitor trata como externa toda URL que no empiece
    // con server.url. app/page.tsx redirige a /app/inicio por user-agent.
    url: serverUrl,
    cleartext: isDevServer,
    errorPath: "offline.html",
    // Stripe Checkout (y 3-D Secure) se queda dentro de la app para que el
    // regreso (success_url) vuelva a la misma sesión.
    allowNavigation: [
      new URL(serverUrl).hostname,
      "checkout.stripe.com",
      "*.stripe.com",
      "*.stripe.network",
    ],
  },
  appendUserAgent: "ClubOneApp",
  backgroundColor: "#0A0E14",
  ios: {
    contentInset: "never",
    scheme: "Club One",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: isDevServer,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: "#0A0E14",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0A0E14",
      overlaysWebView: true,
    },
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
  },
};

export default config;

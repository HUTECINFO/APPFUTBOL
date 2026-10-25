// Prepara mobile/www antes de `cap sync`: escribe config.js con la URL de
// inicio para que la pantalla sin conexión pueda reintentar.
import { existsSync, readFileSync, writeFileSync } from "fs";

function readMobileEnv() {
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

const serverUrl = (process.env.CAPACITOR_SERVER_URL || readMobileEnv().CAPACITOR_SERVER_URL || "").replace(/\/$/, "");

if (!serverUrl) {
  console.error("✖ Falta CAPACITOR_SERVER_URL (ver .env.mobile.example y docs/APP_MOVIL.md).");
  process.exit(1);
}

if (process.argv.includes("--release") && !serverUrl.startsWith("https://")) {
  console.error(`✖ Para publicar en las tiendas la URL debe ser https:// (actual: ${serverUrl}).`);
  process.exit(1);
}

const startUrl = serverUrl;
writeFileSync(
  "mobile/www/config.js",
  `window.CLUB_ONE_CONFIG = ${JSON.stringify({ serverUrl, startUrl })};\n`
);
console.log(`✔ App nativa apuntando a ${startUrl}`);

import type { MetadataRoute } from "next";
import { CLUB_ONE_FAVICON_URL } from "@/lib/brand-assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Club One",
    short_name: "Club One",
    description: "Plataforma SaaS premium para gestionar clubes y academias deportivas. One club. One platform.",
    start_url: "/app",
    display: "standalone",
    background_color: "#0A0E14",
    theme_color: "#0A0E14",
    orientation: "portrait",
    scope: "/",
    lang: "es-MX",
    icons: [{
      src: CLUB_ONE_FAVICON_URL,
      sizes: "1254x1254",
      type: "image/png",
      purpose: "any",
    }],
  };
}

import { signOut } from "next-auth/react";

/**
 * Cierra la sesión y navega a una ruta relativa del mismo dominio. Con
 * `callbackUrl` NextAuth arma la URL final con NEXTAUTH_URL, y si esa variable
 * apunta a otro host (p. ej. localhost) la app nativa terminaba fuera del sitio.
 */
export async function signOutTo(path: string) {
  await signOut({ redirect: false });
  window.location.assign(path);
}

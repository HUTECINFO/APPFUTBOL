/** Configuración del evento USA Goalkeeper Tour 2026. */
export const EVENTO_TOUR = {
  clubSlug: "usa-goalkeeper-tour-2026",
  nombre: "USA Goalkeeper Tour 2026",
  precioUsd: 350,
  moneda: "usd",
  posicionFija: "Portero",
  cupoPorSede: 60,
} as const;

export function esClubEvento(slug?: string | null): boolean {
  return slug === EVENTO_TOUR.clubSlug;
}

export function formatUsd(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { EVENTO_TOUR, formatUsd } from "@/lib/evento-tour";

export function RetryCheckoutButton({ solicitudId }: { solicitudId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reintentar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/public/evento/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo iniciar el pago");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}
      <button
        onClick={reintentar}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pitch-500 to-pitch-400 font-display text-sm font-bold uppercase tracking-[0.15em] text-dark-900 transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Abriendo pago..." : `Reintentar pago · ${formatUsd(EVENTO_TOUR.precioUsd)} USD`}
      </button>
    </div>
  );
}

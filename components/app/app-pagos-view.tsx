"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CreditCard, CheckCircle, AlertCircle, Wallet } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface AppPagosViewProps {
  mensualidades: any[];
  stripeEnabled: boolean;
}

const ESTADO_STYLE: Record<string, string> = {
  PAGADO: "border-green-500/25 bg-green-500/10 text-green-400",
  VENCIDO: "border-red-500/25 bg-red-500/10 text-red-400",
  REEMBOLSADO: "border-blue-500/25 bg-blue-500/10 text-blue-400",
  PENDIENTE: "border-gold-500/25 bg-gold-500/10 text-gold-400",
};

export function AppPagosView({ mensualidades, stripeEnabled }: AppPagosViewProps) {
  const searchParams = useSearchParams();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const totalPendiente = mensualidades
    .filter((m) => m.estado === "PENDIENTE" || m.estado === "VENCIDO")
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const totalPagado = mensualidades
    .filter((m) => m.estado === "PAGADO")
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const total = totalPagado + totalPendiente;
  const progreso = total > 0 ? Math.round((totalPagado / total) * 100) : 100;

  const handleCheckout = async (mensualidadId: string) => {
    setPayingId(mensualidadId);
    setError("");
    try {
      const res = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensualidadId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo iniciar el pago");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setPayingId(null);
    }
  };

  return (
    <div className="px-4 pt-6 safe-area-pt">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-400">Club</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight">Pagos</h1>
      </motion.header>

      {searchParams.get("resultado") === "exitoso" && (
        <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          Pago recibido. La confirmación se actualizará en unos momentos.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="gold-glow relative mb-6 overflow-hidden rounded-[1.75rem] border border-gold-500/25 bg-gradient-to-br from-gold-900/60 via-dark-800 to-dark-900"
      >
        <div aria-hidden className="pitch-stripes absolute inset-0" />
        <div aria-hidden className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-gold-400/15 blur-3xl" />
        <div
          aria-hidden
          className="animate-hero-sheen pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        <div className="relative p-5">
          <div className="mb-1 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gold-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Balance por pagar</p>
          </div>
          <p className="font-display text-5xl font-bold tabular-nums tracking-tight text-white">
            {formatCurrency(totalPendiente)}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest">
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="h-3 w-3" /> Pagado {formatCurrency(totalPagado)}
              </span>
              <span className="text-white/40">{progreso}% al corriente</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-pitch-500 to-pitch-400"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide">Mensualidades</h2>
      <div className="space-y-3">
        {mensualidades.length === 0 ? (
          <Card className="glass-panel p-8 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-white/20" />
            <p className="text-white/60">No tienes mensualidades registradas.</p>
          </Card>
        ) : (
          mensualidades.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
            >
              <Card className="glass-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{m.jugador.nombre}</p>
                    <p className="truncate text-xs text-white/50">
                      {m.jugador.equipo.nombre} · {m.jugador.equipo.club.nombre}
                    </p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest", ESTADO_STYLE[m.estado] || ESTADO_STYLE.PENDIENTE)}>
                    {m.estado}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-widest text-white/40">Periodo {m.periodo}</p>
                  <p className="font-display text-xl font-bold tabular-nums text-white">
                    {formatCurrency(parseFloat(m.monto))}
                  </p>
                </div>
                {m.estado === "PAGADO" && m.fechaPago && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-green-400/70">
                    <CheckCircle className="h-3 w-3" /> Pagado el {formatDate(m.fechaPago)}
                  </p>
                )}
                {m.estado === "VENCIDO" && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-red-400/80">
                    <AlertCircle className="h-3 w-3" /> Mensualidad vencida
                  </p>
                )}
                {(m.estado === "PENDIENTE" || m.estado === "VENCIDO") && (
                  stripeEnabled ? (
                    <button
                      className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pitch-500 to-pitch-400 text-sm font-bold uppercase tracking-wider text-dark-900 transition-transform active:scale-95 disabled:opacity-60"
                      disabled={payingId === m.id}
                      onClick={() => handleCheckout(m.id)}
                    >
                      <CreditCard className="h-4 w-4" />
                      {payingId === m.id ? "Abriendo pago..." : "Pagar ahora"}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-white/40">Contacta al club para completar tu pago.</p>
                  )
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

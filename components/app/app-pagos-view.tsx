"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AppPagosViewProps {
  mensualidades: any[];
  stripeEnabled: boolean;
}

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
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/inicio">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Pagos</h1>
      </div>

      {searchParams.get("resultado") === "exitoso" && (
        <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          Pago recibido. La confirmación se actualizará en unos momentos.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-xs text-white/60">Pagado</p>
          </div>
          <p className="text-lg font-display font-bold text-white">{formatCurrency(totalPagado)}</p>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-white/60">Pendiente</p>
          </div>
          <p className="text-lg font-display font-bold text-white">{formatCurrency(totalPendiente)}</p>
        </Card>
      </div>

      <h2 className="text-lg font-display font-semibold mb-3">Mis mensualidades</h2>
      <div className="space-y-3">
        {mensualidades.length === 0 ? (
          <Card className="glass-panel p-8 text-center">
            <CreditCard className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No tienes mensualidades registradas.</p>
          </Card>
        ) : (
          mensualidades.map((m) => (
            <Card key={m.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-white">{m.jugador.nombre}</p>
                  <p className="text-xs text-white/50">
                    {m.jugador.equipo.nombre} · {m.jugador.equipo.club.nombre}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                    m.estado === "PAGADO"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : m.estado === "VENCIDO"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : m.estado === "REEMBOLSADO"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                  }`}
                >
                  {m.estado}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/40">Periodo {m.periodo}</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(parseFloat(m.monto))}</p>
              </div>
              {m.estado === "PAGADO" && m.fechaPago && (
                <p className="text-xs text-white/40 mt-2">Pagado el {formatDate(m.fechaPago)}</p>
              )}
              {(m.estado === "PENDIENTE" || m.estado === "VENCIDO") && (
                stripeEnabled ? (
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-pitch-500 font-semibold text-dark-900 hover:bg-pitch-400"
                    disabled={payingId === m.id}
                    onClick={() => handleCheckout(m.id)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {payingId === m.id ? "Abriendo pago..." : "Pagar con tarjeta"}
                  </Button>
                ) : (
                  <p className="text-xs text-white/40 mt-2">Contacta al club para completar tu pago.</p>
                )
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

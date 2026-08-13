"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { formatUsd } from "@/lib/evento-tour";
import { cn } from "@/lib/utils";
import { CircleDollarSign, Goal, Hourglass, MapPin, Users } from "lucide-react";

interface Kpis {
  ingresosUsd: number;
  pagados: number;
  pendientesPago: number;
  cupoTotal: number;
  inscritos: number;
  precioUsd: number;
}

interface SedeMetrica {
  id: string;
  nombre: string;
  categoria: string;
  cupo: number;
  inscritos: number;
  pagados: number;
  pendientes: number;
  ingresosUsd: number;
}

interface EventoDashboardViewProps {
  esEvento: boolean;
  clubNombre: string;
  kpis: Kpis;
  sedes: SedeMetrica[];
  solicitudes: any[];
}

const ESTADO_STYLE: Record<string, string> = {
  APROBADA: "border-green-500/25 bg-green-500/10 text-green-400",
  PENDIENTE: "border-gold-500/25 bg-gold-500/10 text-gold-400",
  LISTA_ESPERA: "border-blue-500/25 bg-blue-500/10 text-blue-400",
  RECHAZADA: "border-red-500/25 bg-red-500/10 text-red-400",
};

const ESTADO_LABEL: Record<string, string> = {
  APROBADA: "Pagado",
  PENDIENTE: "Pendiente de pago",
  LISTA_ESPERA: "Lista de espera",
  RECHAZADA: "Rechazada",
};

export function EventoDashboardView({ esEvento, clubNombre, kpis, sedes, solicitudes }: EventoDashboardViewProps) {
  if (!esEvento) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card className="glass-panel p-10 text-center">
          <Goal className="mx-auto mb-4 h-10 w-10 text-white/20" />
          <h1 className="font-display text-2xl font-bold">Este club no es un evento</h1>
          <p className="mt-2 text-white/60">
            El panel de métricas de evento aplica únicamente para {clubNombre.includes("Tour") ? "el tour" : "clubes configurados como evento"}.
            Las métricas de suscripción y operación normal están en Dashboard y Cobros.
          </p>
        </Card>
      </div>
    );
  }

  const ocupacion = kpis.cupoTotal > 0 ? Math.round((kpis.pagados / kpis.cupoTotal) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pitch-400">Panel del evento</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          USA Goalkeeper Tour <span className="text-gradient">2026</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/50">
          Métricas exclusivas del evento, separadas de la operación por suscripción de la plataforma.
          Todos los montos están en dólares americanos (USD).
        </p>
      </motion.header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={CircleDollarSign}
          label="Ingresos confirmados"
          value={formatUsd(kpis.ingresosUsd)}
          hint="USD · pagos aprobados"
          accent="text-gold-400"
          delay={0}
        />
        <KpiCard
          icon={Goal}
          label="Porteros pagados"
          value={String(kpis.pagados)}
          hint={`${ocupacion}% del cupo total`}
          accent="text-pitch-400"
          delay={0.05}
        />
        <KpiCard
          icon={Hourglass}
          label="Pendientes de pago"
          value={String(kpis.pendientesPago)}
          hint="solicitudes sin pagar"
          accent="text-blue-400"
          delay={0.1}
        />
        <KpiCard
          icon={Users}
          label="Cupo restante"
          value={String(Math.max(0, kpis.cupoTotal - kpis.pagados))}
          hint={`de ${kpis.cupoTotal} lugares`}
          accent="text-white/70"
          delay={0.15}
        />
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide">Sedes</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sedes.map((sede, i) => {
          const pct = sede.cupo > 0 ? Math.min(100, Math.round((sede.pagados / sede.cupo) * 100)) : 0;
          return (
            <motion.div
              key={sede.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="glass-card relative overflow-hidden p-5">
                <div aria-hidden className="pitch-stripes absolute inset-0 opacity-50" />
                <div className="relative">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pitch-300">
                    <MapPin className="h-3 w-3" /> {sede.categoria}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold uppercase text-white">{sede.nombre}</h3>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest">
                      <span className="text-white/50">{sede.pagados}/{sede.cupo} pagados</span>
                      <span className="text-pitch-300">{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-pitch-500 to-pitch-400"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-white/10 pt-3 text-xs">
                    <span className="text-white/50">{sede.pendientes} pendiente{sede.pendientes === 1 ? "" : "s"}</span>
                    <span className="font-display font-bold tabular-nums text-gold-400">{formatUsd(sede.ingresosUsd)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide">Solicitudes del evento</h2>
      <Card className="glass-panel overflow-hidden">
        {solicitudes.length === 0 ? (
          <p className="p-8 text-center text-white/50">Aún no hay solicitudes para este evento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <th className="px-5 py-3">Portero</th>
                  <th className="px-5 py-3">Sede</th>
                  <th className="px-5 py-3">Tutor</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{s.nombreJugador}</p>
                      <p className="text-xs text-white/40">
                        {new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(new Date(s.createdAt))}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-white/70">{s.equipo?.nombre || "—"}</td>
                    <td className="px-5 py-3">
                      <p className="text-white/70">{s.nombreTutor}</p>
                      <p className="text-xs text-white/40">{s.emailTutor}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest", ESTADO_STYLE[s.estado] || ESTADO_STYLE.PENDIENTE)}>
                        {ESTADO_LABEL[s.estado] || s.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-display font-bold tabular-nums text-white">
                      {s.estado === "APROBADA" ? formatUsd(kpis.precioUsd) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="glass-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Icon className={cn("h-4 w-4", accent)} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</p>
        </div>
        <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">{value}</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-white/35">{hint}</p>
      </Card>
    </motion.div>
  );
}

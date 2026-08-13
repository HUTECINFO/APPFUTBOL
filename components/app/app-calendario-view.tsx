"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Calendar, Check, X, MapPin, Trophy, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface JugadorLite {
  id: string;
  nombre: string;
  equipoId: string;
}

interface AppCalendarioViewProps {
  eventos: any[];
  jugadores: JugadorLite[];
}

const TIPO_META: Record<string, { label: string; icon: any; badge: string }> = {
  PARTIDO: { label: "Partido", icon: Trophy, badge: "border-gold-500/30 bg-gold-500/10 text-gold-400" },
  TORNEO: { label: "Torneo", icon: Sparkles, badge: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  ENTRENAMIENTO: { label: "Entreno", icon: Dumbbell, badge: "border-pitch-500/30 bg-pitch-500/10 text-pitch-400" },
};

const FILTROS = [
  { value: "TODOS", label: "Todos" },
  { value: "PARTIDO", label: "Partidos" },
  { value: "ENTRENAMIENTO", label: "Entrenos" },
  { value: "TORNEO", label: "Torneos" },
];

export function AppCalendarioView({ eventos, jugadores }: AppCalendarioViewProps) {
  const router = useRouter();
  const [filtro, setFiltro] = useState("TODOS");
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  const ahora = Date.now();
  const filtrados = useMemo(
    () => eventos.filter((e) => filtro === "TODOS" || e.tipo === filtro),
    [eventos, filtro]
  );

  const grupos = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const e of filtrados) {
      const key = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(e.fecha));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries());
  }, [filtrados]);

  const jugadorDe = (evento: any): JugadorLite | undefined => {
    const conAsistencia = evento.asistencias?.[0]?.jugador?.id;
    if (conAsistencia) return jugadores.find((j) => j.id === conAsistencia);
    return jugadores.find((j) => j.equipoId === evento.equipo.id) || jugadores[0];
  };

  const handleRsvp = async (evento: any, estado: string) => {
    const jugador = jugadorDe(evento);
    if (!jugador) return;
    setRsvpLoading(`${evento.id}-${estado}`);
    const res = await fetch(`/api/clubs/${evento.equipo.clubId}/eventos/${evento.id}/asistencia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jugadorId: jugador.id, estado }),
    });
    setRsvpLoading(null);
    if (res.ok) router.refresh();
  };

  return (
    <div className="px-4 pt-6 safe-area-pt">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-pitch-400">Temporada</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight">Agenda</h1>
      </motion.header>

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all active:scale-95",
              filtro === f.value
                ? "border-pitch-400/50 bg-pitch-500/20 text-pitch-300"
                : "border-white/10 bg-white/5 text-white/50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {grupos.length === 0 ? (
        <Card className="glass-panel p-8 text-center">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-white/60">No hay eventos en esta categoría.</p>
        </Card>
      ) : (
        grupos.map(([mes, items]) => (
          <section key={mes} className="mb-7">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-white/40">
              {mes}
            </h2>
            <div className="space-y-3">
              {items.map((e, i) => {
                const meta = TIPO_META[e.tipo] || TIPO_META.ENTRENAMIENTO;
                const Icon = meta.icon;
                const fecha = new Date(e.fecha);
                const pasado = fecha.getTime() < ahora;
                const asistencia = e.asistencias?.[0];
                const estadoActual = asistencia?.estado;
                const jugador = jugadorDe(e);

                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className={cn("glass-card p-4", pasado && !e.terminado && "opacity-60")}>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-black/30">
                          <span className="font-display text-xl font-bold leading-none text-white">
                            {fecha.getDate()}
                          </span>
                          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-pitch-300">
                            {new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(fecha)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">{e.titulo}</p>
                          <p className="truncate text-xs text-white/50">
                            {e.equipo.nombre}
                            {e.rival ? ` · vs ${e.rival}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-pitch-400">
                            {new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(fecha)}
                          </p>
                        </div>
                        <span className={cn("flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest", meta.badge)}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </div>

                      {e.terminado && (e.marcadorLocal != null || e.marcadorVisitante != null) && (
                        <div className="mb-3 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/30 py-2">
                          <span className="font-display text-2xl font-bold text-white">{e.marcadorLocal ?? 0}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Final</span>
                          <span className="font-display text-2xl font-bold text-white">{e.marcadorVisitante ?? 0}</span>
                        </div>
                      )}

                      {e.sede && (
                        e.sede.googleMapsUrl ? (
                          <a
                            href={e.sede.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-3 flex items-center gap-1.5 text-xs text-pitch-400"
                          >
                            <MapPin className="h-3.5 w-3.5" /> {e.sede.nombre}
                          </a>
                        ) : (
                          <p className="mb-3 flex items-center gap-1.5 text-xs text-white/40">
                            <MapPin className="h-3.5 w-3.5" /> {e.sede.nombre}
                          </p>
                        )
                      )}

                      {!pasado && jugador && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRsvp(e, "CONFIRMADO")}
                            disabled={rsvpLoading !== null}
                            className={cn(
                              "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border text-sm font-bold uppercase tracking-wider transition-all active:scale-95",
                              estadoActual === "CONFIRMADO"
                                ? "border-green-400/60 bg-green-500/25 text-green-300"
                                : "border-green-500/25 bg-green-500/5 text-green-400/80"
                            )}
                          >
                            <Check className="h-4 w-4" />
                            {rsvpLoading === `${e.id}-CONFIRMADO` ? "..." : "Asisto"}
                          </button>
                          <button
                            onClick={() => handleRsvp(e, "RECHAZADO")}
                            disabled={rsvpLoading !== null}
                            className={cn(
                              "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border text-sm font-bold uppercase tracking-wider transition-all active:scale-95",
                              estadoActual === "RECHAZADO"
                                ? "border-red-400/60 bg-red-500/25 text-red-300"
                                : "border-red-500/25 bg-red-500/5 text-red-400/80"
                            )}
                          >
                            <X className="h-4 w-4" />
                            {rsvpLoading === `${e.id}-RECHAZADO` ? "..." : "No voy"}
                          </button>
                        </div>
                      )}
                      {!pasado && estadoActual && (
                        <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-white/35">
                          {jugador?.nombre.split(" ")[0]} · {estadoActual === "CONFIRMADO" ? "confirmado" : estadoActual === "RECHAZADO" ? "no asiste" : "pendiente"}
                        </p>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

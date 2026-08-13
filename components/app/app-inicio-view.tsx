"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Calendar, CreditCard, MessageSquare, User, ChevronRight, MapPin, Trophy, Dumbbell, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { MatchCountdown } from "@/components/app/match-countdown";

interface AppInicioViewProps {
  user: any;
  jugadores: any[];
  eventos: any[];
}

const TIPO_META: Record<string, { label: string; icon: any }> = {
  PARTIDO: { label: "Próximo partido", icon: Trophy },
  TORNEO: { label: "Torneo", icon: Sparkles },
  ENTRENAMIENTO: { label: "Entrenamiento", icon: Dumbbell },
};

const CARD_GRADIENTS = [
  "from-pitch-500/25 via-dark-700 to-dark-800",
  "from-gold-500/20 via-dark-700 to-dark-800",
  "from-blue-500/20 via-dark-700 to-dark-800",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

const quickActions = [
  { href: "/app/calendario", label: "Agenda", icon: Calendar, color: "text-pitch-400", glow: "bg-pitch-500/15 border-pitch-500/25" },
  { href: "/app/pagos", label: "Pagos", icon: CreditCard, color: "text-gold-400", glow: "bg-gold-500/15 border-gold-500/25" },
  { href: "/app/chat", label: "Chat", icon: MessageSquare, color: "text-blue-400", glow: "bg-blue-500/15 border-blue-500/25" },
  { href: "/app/perfil", label: "Perfil", icon: User, color: "text-white/80", glow: "bg-white/10 border-white/15" },
];

export function AppInicioView({ user, jugadores, eventos }: AppInicioViewProps) {
  const proximo = eventos[0];
  const agenda = eventos.slice(proximo ? 1 : 0);
  const tipoMeta = proximo ? TIPO_META[proximo.tipo] || TIPO_META.ENTRENAMIENTO : null;
  const TipoIcon = tipoMeta?.icon;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-4 pt-6 safe-area-pt"
    >
      <motion.header variants={item} className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-pitch-400">
            {greeting()}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight">
            <span className="text-gradient">{user.name?.split(" ")[0]}</span>
          </h1>
          <p className="mt-0.5 text-xs text-white/40">
            {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
          </p>
        </div>
        <Link
          href="/app/perfil"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-lg font-bold text-pitch-300"
        >
          {user.name?.charAt(0).toUpperCase()}
        </Link>
      </motion.header>

      {proximo && tipoMeta && TipoIcon && (
        <motion.section variants={item} className="mb-6">
          <div className="matchday-glow relative overflow-hidden rounded-[1.75rem] border border-pitch-400/25 bg-gradient-to-br from-pitch-900 via-dark-800 to-dark-900">
            <div aria-hidden className="pitch-stripes absolute inset-0" />
            <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pitch-400/20 blur-3xl" />
            <div
              aria-hidden
              className="animate-hero-sheen pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />

            <div className="relative p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full border border-pitch-400/30 bg-pitch-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-pitch-300">
                  <TipoIcon className="h-3 w-3" />
                  {tipoMeta.label}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                  {proximo.equipo.nombre}
                </span>
              </div>

              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl font-bold uppercase tracking-wide text-white">
                    {proximo.equipo.nombre}
                  </p>
                  {proximo.rival && (
                    <>
                      <p className="my-0.5 font-display text-xs font-bold uppercase tracking-[0.3em] text-gold-400">vs</p>
                      <p className="truncate font-display text-xl font-bold uppercase tracking-wide text-white/85">
                        {proximo.rival}
                      </p>
                    </>
                  )}
                  {!proximo.rival && (
                    <p className="mt-0.5 truncate text-sm text-white/60">{proximo.titulo}</p>
                  )}
                </div>
                <div className="shrink-0 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-center">
                  <p className="font-display text-3xl font-bold leading-none text-white">
                    {new Date(proximo.fecha).getDate()}
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-pitch-300">
                    {new Intl.DateTimeFormat("es-MX", { month: "short" }).format(new Date(proximo.fecha))}
                  </p>
                </div>
              </div>

              <MatchCountdown target={proximo.fecha} />

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5 text-xs text-white/50">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-pitch-400" />
                  <span className="truncate">
                    {proximo.sede?.nombre || "Sede por confirmar"} ·{" "}
                    {new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date(proximo.fecha))}
                  </span>
                </div>
                <Link
                  href="/app/calendario"
                  className="shrink-0 rounded-full bg-pitch-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-dark-900 transition-transform active:scale-95"
                >
                  Confirmar
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <motion.section variants={item} className="mb-6">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-14 w-full items-center justify-center rounded-2xl border backdrop-blur-md transition-transform active:scale-90 ${action.glow}`}
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                    {action.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      {jugadores.length > 0 && (
        <motion.section variants={item} className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Mi plantilla</h2>
            {jugadores.length > 1 && (
              <span className="text-[10px] uppercase tracking-widest text-white/30">Desliza →</span>
            )}
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
            {jugadores.map((j, i) => (
              <motion.div
                key={j.id}
                whileTap={{ scale: 0.96 }}
                className={`relative w-40 shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-4 ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
              >
                <div aria-hidden className="pitch-lines absolute inset-0 opacity-60" />
                <p aria-hidden className="text-outline pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-bold">
                  {j.dorsal ?? ""}
                </p>
                <div className="relative">
                  <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/70">
                    {j.posicion}
                  </span>
                  <div className="mt-6">
                    <p className="font-display text-lg font-bold uppercase leading-tight text-white">
                      {j.apodo || j.nombre.split(" ")[0]}
                    </p>
                    {j.apodo && <p className="truncate text-xs text-white/50">{j.nombre}</p>}
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-white/40">
                      {j.equipo.nombre}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-pitch-300/80">
                      {j.equipo.club.nombre}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={item}>
        <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide">Agenda</h2>
        {agenda.length === 0 ? (
          proximo ? null : (
            <Card className="glass-panel p-8 text-center">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-white/20" />
              <p className="text-white/60">No hay eventos próximos.</p>
            </Card>
          )
        ) : (
          <div className="space-y-3">
            {agenda.map((e) => {
              const meta = TIPO_META[e.tipo] || TIPO_META.ENTRENAMIENTO;
              const Icon = meta.icon;
              return (
                <Link key={e.id} href="/app/calendario">
                  <Card className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-black/30">
                      <span className="font-display text-base font-bold leading-none text-white">
                        {new Date(e.fecha).getDate()}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-pitch-300">
                        {new Intl.DateTimeFormat("es-MX", { month: "short" }).format(new Date(e.fecha))}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{e.titulo}</p>
                      <p className="truncate text-xs text-white/50">
                        {e.equipo.nombre} · {formatDateTime(e.fecha)}
                      </p>
                    </div>
                    <Icon className="h-4 w-4 shrink-0 text-white/30" />
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/20" />
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

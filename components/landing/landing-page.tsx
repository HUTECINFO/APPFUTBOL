"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bank as Banknote,
  Building as Building2,
  Calendar as CalendarDays,
  Check,
  NavArrowRight as ChevronRight,
  TaskList as ClipboardList,
  SoccerBall as Goal,
  GraduationCap,
  ViewGrid as Layers3,
  MapPin,
  MenuScale as Menu,
  MessageText as MessageSquareText,
  ShieldCheck,
  Trophy,
  UserCircle as UserRound,
  Community as Users,
  Xmark as X,
  Flash as Zap,
} from "iconoir-react";
import { AnimatedBackground } from "@/components/landing/animated-background";
import { Button } from "@/components/ui/button";
import { ClubOneMark } from "@/components/branding/club-one-mark";

const navLinks = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#operacion", label: "Operación" },
  { href: "#eventos", label: "Eventos" },
];

const pillars = [
  { icon: Building2, eyebrow: "CLUBES", title: "Una visión clara de toda tu estructura.", text: "Equipos, sedes, entrenadores y familias conectados sin perseguir mensajes ni archivos." },
  { icon: GraduationCap, eyebrow: "ACADEMIAS", title: "De la primera sesión al siguiente nivel.", text: "Organiza categorías, grupos y procesos de formación con una operación que sí escala." },
  { icon: UserRound, eyebrow: "STAFF", title: "El equipo técnico, siempre alineado.", text: "Calendario, comunicación, asistencias y tareas en un solo ritmo de trabajo." },
];

const tourStops = [
  { city: "El Paso", date: "19–20 SEP", number: "01" },
  { city: "Dallas–Fort Worth", date: "03–04 OCT", number: "02" },
  { city: "Houston", date: "17–18 OCT", number: "03" },
  { city: "San Antonio", date: "31 OCT–01 NOV", number: "04" },
];

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main id="contenido-principal" className="min-h-screen overflow-x-hidden bg-dark-900 text-foreground">
      <AnimatedBackground />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
        <div className={"pointer-events-auto mx-auto max-w-6xl transition-all duration-500 " + (scrolled ? "max-w-5xl" : "")}>
          <div className={"relative flex items-center justify-between border border-white/10 bg-dark-900/75 px-3 py-2 shadow-[0_16px_50px_rgba(0,0,0,.28)] backdrop-blur-2xl transition-all duration-500 sm:px-4 " + (scrolled ? "rounded-[1.65rem] border-white/15" : "rounded-[1.9rem]")}>
            <Link href="/" className="flex items-center gap-2.5" aria-label="Club One inicio">
              <span className="grid h-10 w-10 place-items-center rounded-[1rem] border border-white/10 bg-white/[.05] sm:h-11 sm:w-11">
                <ClubOneMark className="h-8 w-8 sm:h-9 sm:w-9" priority />
              </span>
              <span className="leading-none">
                <span className="block font-display text-lg font-bold tracking-wide text-white">CLUB <span className="text-gradient">ONE</span></span>
                <span className="mt-1 block text-[10px] font-semibold tracking-[.17em] text-white/40">FOOTBALL OPERATIONS</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-white/[.08] bg-black/15 p-1 md:flex" aria-label="Navegación principal">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/[.07] hover:text-white">{link.label}</a>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login"><Button variant="ghost" className="h-10 rounded-full px-4 text-white/75 hover:bg-white/10 hover:text-white">Entrar</Button></Link>
              <Link href="/registro"><Button className="h-10 rounded-full bg-pitch-500 px-5 font-bold text-dark-900 hover:bg-pitch-400">Crear mi club <ArrowUpRight className="ml-1.5 h-4 w-4" /></Button></Link>
            </div>

            <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Abrir menú">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="mt-2 overflow-hidden rounded-[1.5rem] border border-white/10 bg-dark-800/95 p-3 shadow-2xl backdrop-blur-2xl md:hidden">
              <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
                {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/[.06]">{link.label}</a>)}
              </nav>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <Link href="/login"><Button variant="outline" className="w-full rounded-xl border-white/15 text-white hover:bg-white/10">Entrar</Button></Link>
                <Link href="/registro"><Button className="w-full rounded-xl bg-pitch-500 font-bold text-dark-900 hover:bg-pitch-400">Crear club</Button></Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="relative px-6 pb-20 pt-36 sm:pb-28 sm:pt-44 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
            <p className="mb-7 text-sm font-medium text-pitch-300">Gestión que juega en equipo</p>
            <h1 className="max-w-3xl font-display text-[3.35rem] font-bold leading-[.86] tracking-[-.035em] text-white sm:text-7xl xl:text-8xl">El fútbol se mueve rápido.<br /><span className="text-gradient">Tu club también.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/65 sm:text-lg">Club One reúne la operación de clubes, academias, entrenadores y jugadores en un solo sistema. Menos caos administrativo. Más tiempo para formar, competir y crecer.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/registro"><Button size="lg" className="h-14 rounded-full bg-pitch-500 px-7 text-base font-bold text-dark-900 shadow-lg shadow-pitch-500/20 hover:bg-pitch-400">Empezar con mi organización <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <button type="button" onClick={() => goTo("plataforma")} className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-7 text-base font-semibold text-white transition hover:border-white/35 hover:bg-white/[.06]">Conocer la plataforma <ChevronRight className="ml-1 h-5 w-5" /></button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/50">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-pitch-400" /> Hecho para fútbol</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-pitch-400" /> Clubes y academias</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-pitch-400" /> Tu operación, conectada</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .75, delay: .1 }} className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-12 rounded-full bg-pitch-500/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#101823]/90 p-4 shadow-2xl shadow-black/45 sm:p-5">
              <div className="absolute inset-0 opacity-[.23] [background-image:radial-gradient(rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-pitch-500 text-dark-900"><Layers3 className="h-4 w-4" /></span><div><p className="text-sm font-bold text-white">Centro de operación</p><p className="text-xs text-white/40">Club One · Hoy</p></div></div><span className="rounded-full border border-pitch-400/20 bg-pitch-500/10 px-2.5 py-1 text-[10px] font-bold tracking-[.15em] text-pitch-300">EN VIVO</span>
              </div>
              <div className="relative mt-4 grid gap-3 sm:grid-cols-[1.18fr_.82fr]">
                <div className="rounded-[1.4rem] border border-white/10 bg-dark-900/70 p-4">
                  <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-white/40">Próximo entrenamiento</p><p className="mt-2 font-display text-2xl font-bold leading-none text-white">U17 · Intensidad</p></div><Activity className="h-5 w-5 text-pitch-400" /></div>
                  <div className="mt-6 rounded-xl border border-white/[.07] bg-white/[.035] p-3"><div className="flex items-center justify-between text-xs text-white/55"><span>Asistencia confirmada</span><span className="font-bold text-pitch-300">18 / 20</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[90%] rounded-full bg-gradient-to-r from-pitch-500 to-pitch-300" /></div></div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/45"><CalendarDays className="h-3.5 w-3.5 text-gold-400" /> Hoy · 18:30 · Sede Norte</div>
                </div>
                <div className="grid gap-3"><Metric icon={Users} value="186" label="jugadores activos" /><Metric icon={MessageSquareText} value="12" label="mensajes por revisar" /><Metric icon={Banknote} value="94%" label="cobranza del mes" gold /></div>
              </div>
              <div className="relative mt-3 grid grid-cols-3 gap-2"><MiniAction icon={ClipboardList} label="Registro" /><MiniAction icon={CalendarDays} label="Calendario" /><MiniAction icon={ShieldCheck} label="Expedientes" /></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025] px-6 py-6 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"><p className="text-sm font-medium text-white/60">La operación deportiva no debería vivir en cinco apps distintas.</p><div className="flex items-center gap-5 text-xs font-bold uppercase tracking-[.14em] text-white/35"><span>Equipos</span><span className="h-1 w-1 rounded-full bg-gold-400" /><span>Personas</span><span className="h-1 w-1 rounded-full bg-gold-400" /><span>Eventos</span></div></div></section>

      <section id="plataforma" className="scroll-mt-28 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-pitch-400">Una plataforma, todo el juego</p><h2 className="font-display text-4xl font-bold leading-[.92] text-white sm:text-6xl">La administración deja de ser<br /><span className="text-gradient">un partido aparte.</span></h2><p className="mt-6 max-w-2xl text-base leading-7 text-white/55">Cada rol ve lo que necesita y todos trabajan sobre la misma cancha: información actualizada, decisiones rápidas y seguimiento real.</p></div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar, index) => <motion.article key={pillar.eyebrow} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .08 }} className="group rounded-[1.8rem] border border-white/10 bg-dark-800/45 p-7 transition duration-300 hover:-translate-y-1 hover:border-pitch-400/35 hover:bg-dark-800/75"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-pitch-400/20 bg-pitch-500/10 text-pitch-400"><pillar.icon className="h-5 w-5" /></span><p className="mt-9 text-xs font-bold tracking-[.2em] text-gold-400">{pillar.eyebrow}</p><h3 className="mt-3 font-display text-3xl font-bold leading-[.94] text-white">{pillar.title}</h3><p className="mt-4 max-w-sm text-sm leading-6 text-white/55">{pillar.text}</p><span className="mt-7 inline-flex items-center text-sm font-bold text-pitch-400">Todo conectado <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span></motion.article>)}
          </div>
        </div>
      </section>

      <section id="operacion" className="scroll-mt-28 border-y border-white/10 bg-dark-800/35 px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-20">
          <div><p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-gold-400">El ritmo del club, en un vistazo</p><h2 className="font-display text-4xl font-bold leading-[.92] text-white sm:text-6xl">Menos pendientes.<br /><span className="text-gradient">Más cancha.</span></h2><p className="mt-6 max-w-md text-base leading-7 text-white/55">Haz que cada área avance sin perder contexto. Desde el registro de un jugador hasta la comunicación del próximo entrenamiento.</p><Link href="/registro" className="mt-8 inline-flex items-center text-sm font-bold text-pitch-400 hover:text-pitch-300">Conocer Club One <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-dark-900/60 p-4 sm:p-6"><div className="grid gap-3 sm:grid-cols-2"><OperationRow icon={Users} title="Jugadores y familias" detail="Expedientes completos y comunicación clara." /><OperationRow icon={CalendarDays} title="Calendario deportivo" detail="Sesiones, partidos y eventos sin cruces." /><OperationRow icon={Banknote} title="Cobros y seguimiento" detail="Visibilidad de pagos para cada equipo." /><OperationRow icon={MessageSquareText} title="Conversaciones útiles" detail="Avisos que llegan a la persona correcta." /></div><div className="mt-3 flex items-center gap-3 rounded-2xl border border-gold-400/15 bg-gold-400/[.06] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-400 text-dark-900"><Zap className="h-4 w-4" /></span><p className="text-sm leading-5 text-white/70"><strong className="text-white">Todo sigue conectado:</strong> cada movimiento deja la operación lista para el siguiente.</p></div></div>
        </div>
      </section>

      <section id="eventos" className="scroll-mt-28 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border border-pitch-400/20 bg-[#0b1e19] p-7 shadow-2xl shadow-pitch-500/10 sm:p-10 lg:p-12">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div><div className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[.16em] text-gold-400"><Trophy className="h-3.5 w-3.5" /> Evento destacado</div><p className="mt-7 text-xs font-bold uppercase tracking-[.28em] text-pitch-400">Club One presenta</p><h2 className="mt-4 font-display text-5xl font-bold leading-[.88] text-white sm:text-6xl">USA Goalkeeper<br /><span className="text-gradient">Tour 2026.</span></h2><p className="mt-6 max-w-md text-base leading-7 text-white/60">Una clínica especializada para porteros que Club One opera de punta a punta: sedes, registros, pagos y comunicación.</p><Link href="/usa-goalkeeper-tour-2026" className="mt-8 inline-flex"><Button className="h-12 rounded-full bg-gold-400 px-6 font-bold text-dark-900 hover:bg-gold-300">Ver el tour <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>
            <div className="grid gap-3 sm:grid-cols-2">{tourStops.map((stop) => <Link href="/usa-goalkeeper-tour-2026" key={stop.city} className="group rounded-[1.45rem] border border-white/10 bg-black/20 p-5 transition hover:border-pitch-400/40 hover:bg-white/[.045]"><div className="flex items-start justify-between"><span className="text-xs font-bold tracking-[.18em] text-white/35">PARADA {stop.number}</span><Goal className="h-5 w-5 text-gold-400" /></div><p className="mt-8 font-display text-xl font-bold leading-none text-white">{stop.city}</p><p className="mt-2 flex items-center gap-1.5 text-xs font-bold tracking-[.12em] text-pitch-300"><MapPin className="h-3.5 w-3.5" /> {stop.date}</p></Link>)}</div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><ClubOneMark className="h-7 w-7" /><span className="font-display text-lg font-bold text-white">CLUB <span className="text-gradient">ONE</span></span></div><p className="mt-3 text-xs text-white/40">Gestión que deja más tiempo para el fútbol.</p></div><div className="flex max-w-md flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-white/45"><Link href="/login" className="hover:text-pitch-400">Entrar</Link><Link href="/registro" className="hover:text-pitch-400">Crear organización</Link><Link href="/usa-goalkeeper-tour-2026" className="hover:text-pitch-400">Goalkeeper Tour</Link><Link href="/aviso-de-privacidad" className="hover:text-pitch-400">Privacidad</Link><Link href="/politica-de-cookies" className="hover:text-pitch-400">Cookies</Link><Link href="/terminos-y-condiciones" className="hover:text-pitch-400">Términos</Link><button type="button" onClick={() => window.dispatchEvent(new Event("club-one:cookie-settings"))} className="text-left hover:text-pitch-400">Gestionar cookies</button></div></div></footer>
    </main>
  );
}

function Metric({ icon: Icon, value, label, gold = false }: { icon: typeof Users; value: string; label: string; gold?: boolean }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3"><span className={"grid h-8 w-8 place-items-center rounded-xl " + (gold ? "bg-gold-400/15 text-gold-400" : "bg-pitch-500/10 text-pitch-400")}><Icon className="h-4 w-4" /></span><div><p className="font-display text-xl font-bold leading-none text-white">{value}</p><p className="mt-1 text-[10px] leading-3 text-white/40">{label}</p></div></div>;
}

function MiniAction({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return <div className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-dark-900/55 px-3 py-2.5 text-xs font-medium text-white/55"><Icon className="h-3.5 w-3.5 text-pitch-400" />{label}</div>;
}

function OperationRow({ icon: Icon, title, detail }: { icon: typeof Users; title: string; detail: string }) {
  return <div className="rounded-2xl border border-white/[.09] bg-white/[.03] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl border border-pitch-400/20 bg-pitch-500/10 text-pitch-400"><Icon className="h-4 w-4" /></span><h3 className="mt-5 font-display text-xl font-bold leading-none text-white">{title}</h3><p className="mt-2 text-sm leading-5 text-white/48">{detail}</p></div>;
}

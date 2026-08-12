"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Goal,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { AnimatedBackground } from "@/components/landing/animated-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const stops = [
  { number: "01", city: "El Paso", date: "19–20 SEP", detail: "19–20 septiembre" },
  { number: "02", city: "Dallas–Fort Worth", date: "03–04 OCT", detail: "3–4 octubre" },
  { number: "03", city: "Houston", date: "17–18 OCT", detail: "17–18 octubre" },
  { number: "04", city: "San Antonio", date: "31 OCT–01 NOV", detail: "31 octubre–1 noviembre" },
];

const navLinks = [
  { href: "#tour", label: "El tour" },
  { href: "#sedes", label: "Sedes" },
  { href: "#experiencia", label: "La experiencia" },
];

function scrollToStops() {
  document.getElementById("sedes")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main id="contenido-principal" className="min-h-screen overflow-x-hidden text-foreground">
      <AnimatedBackground />

      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-dark-900/80 py-3 backdrop-blur-xl" : "py-5"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href="/" className="flex items-center gap-3" aria-label="Club One inicio">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-pitch-400/30 bg-pitch-500/15 text-pitch-400"><Goal className="h-5 w-5" /></span>
            <span>
              <span className="block font-display text-lg font-bold leading-none text-white">CLUB <span className="text-gradient">ONE</span></span>
              <span className="mt-1 block text-[9px] font-bold tracking-[0.24em] text-white/40">PRESENTA</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => <a key={link.href} href={link.href} className="text-sm text-white/65 transition hover:text-white">{link.label}</a>)}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login"><Button variant="ghost" className="text-white/75 hover:bg-white/10 hover:text-white">Acceso Club One</Button></Link>
            <Button onClick={scrollToStops} className="bg-pitch-500 font-bold text-dark-900 hover:bg-pitch-400">Elige tu sede <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>

          <button type="button" className="text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && <div className="mx-4 mt-3 flex flex-col gap-4 rounded-2xl border border-white/10 bg-dark-800/95 p-5 shadow-2xl backdrop-blur-xl md:hidden">
          {navLinks.map((link) => <a key={link.href} href={link.href} className="text-sm text-white/70" onClick={() => setMenuOpen(false)}>{link.label}</a>)}
          <Button onClick={() => { setMenuOpen(false); scrollToStops(); }} className="bg-pitch-500 font-bold text-dark-900">Elige tu sede</Button>
        </div>}
      </header>

      <section id="tour" className="relative px-6 pb-20 pt-36 sm:pb-28 lg:px-12 lg:pt-44">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
              <Sparkles className="h-3.5 w-3.5" /> Club One presenta · Texas 2026
            </div>
            <p className="mb-4 font-display text-sm font-bold uppercase tracking-[0.33em] text-pitch-400">USA Goalkeeper Tour</p>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-[.89] tracking-[-.035em] text-white sm:text-7xl xl:text-8xl">
              El área es tuya.<br />
              <span className="text-gradient">Hazla leyenda.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/65">
              Cuatro clínicas de élite para porteros que quieren dominar su juego. Dos días de entrenamiento específico, repeticiones competitivas y desarrollo por posición.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={scrollToStops} className="h-14 bg-pitch-500 px-7 text-base font-bold text-dark-900 shadow-lg shadow-pitch-500/20 hover:bg-pitch-400">
                Reservar mi lugar <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/usa-goalkeeper-tour-2026"><Button size="lg" variant="outline" className="h-14 border-white/20 px-7 text-base text-white hover:bg-white/10">Ver tour completo</Button></Link>
            </div>
            <p className="mt-5 text-xs text-white/35">Inscripción administrada de forma segura por Club One · Cupo limitado por sede</p>
          </motion.div>

          <motion.div initial={false} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 0.12 }} className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-[3rem] bg-pitch-500/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-dark-800/80 p-5 shadow-2xl shadow-black/40 sm:p-7">
              <div className="absolute inset-0 opacity-[.18] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:36px_36px]" />
              <div className="relative rounded-[1.45rem] border border-pitch-400/25 bg-[#0b3b2b] p-5 sm:p-7">
                <div className="absolute inset-x-[15%] top-0 h-16 border-x border-b border-white/30" />
                <div className="absolute inset-x-[30%] top-0 h-8 border-x border-b border-white/30" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/25" />
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
                <div className="relative flex min-h-[22rem] flex-col justify-between sm:min-h-[25rem]">
                  <div className="flex items-center justify-between"><span className="rounded-full border border-white/20 bg-dark-900/55 px-3 py-1.5 text-[10px] font-bold tracking-[.2em] text-white/65">GK PERFORMANCE</span><Trophy className="h-6 w-6 text-gold-400" /></div>
                  <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-4 border-gold-400 bg-dark-900/80 shadow-[0_0_0_12px_rgba(31,203,107,.13),0_0_60px_rgba(242,179,61,.28)]"><Goal className="h-12 w-12 text-gold-400" /></div>
                  <div className="flex items-end justify-between"><div><p className="font-display text-4xl font-bold text-white">2026</p><p className="mt-1 text-xs font-bold tracking-[.16em] text-pitch-400">4 PARADAS · TEXAS</p></div><p className="text-right text-xs leading-5 text-white/55">Entrena.<br />Compite.<br />Destaca.</p></div>
                </div>
              </div>
              <div className="relative -mt-4 mx-3 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-dark-900/90 shadow-xl"><MiniStat value="04" label="ciudades" /><MiniStat value="60" label="cupos" /><MiniStat value="02" label="días" /></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-dark-900/45 px-6 py-7 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3">
          <Ticker icon={CalendarDays} text="Septiembre a noviembre · 2026" />
          <Ticker icon={MapPin} text="El Paso · Dallas · Houston · San Antonio" />
          <Ticker icon={ShieldCheck} text="Inscripción y pago seguro" />
        </div>
      </section>

      <section id="sedes" className="scroll-mt-24 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-pitch-400">Elige tu parada</p><h2 className="font-display text-4xl font-bold leading-none text-white sm:text-6xl">Tu ciudad. Tu arco.<br /><span className="text-gradient">Tu momento.</span></h2></div><p className="max-w-md text-sm leading-6 text-white/55">Cada sede tiene 60 lugares. Selecciona una ciudad y completa tu inscripción para asegurar tu cupo.</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stops.map((stop, index) => <motion.article key={stop.city} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-dark-800/65 p-6 transition duration-300 hover:-translate-y-1 hover:border-pitch-400/45 hover:shadow-2xl hover:shadow-pitch-500/10">
              <span className="font-display text-sm font-bold tracking-[.18em] text-white/25">PARADA {stop.number}</span>
              <p className="mt-10 font-display text-sm font-bold tracking-[.16em] text-gold-400">{stop.date}</p>
              <h3 className="mt-3 font-display text-3xl font-bold leading-none text-white">{stop.city}</h3>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/45"><CalendarDays className="h-4 w-4 text-pitch-400" /> {stop.detail}, 2026</p>
              <Link href="/usa-goalkeeper-tour-2026" className="mt-8 flex items-center text-sm font-bold text-pitch-400 transition group-hover:text-pitch-300">Seleccionar sede <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </motion.article>)}
          </div>
        </div>
      </section>

      <section id="experiencia" className="border-y border-white/10 bg-dark-800/35 px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20"><div><p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-gold-400">Más que una clínica</p><h2 className="font-display text-4xl font-bold leading-[.95] text-white sm:text-6xl">Diseñado para<br /><span className="text-gradient">los que protegen todo.</span></h2><p className="mt-6 max-w-md text-sm leading-6 text-white/55">Una experiencia de alto rendimiento que hace visible el trabajo de quienes sostienen al equipo desde el último metro.</p></div>
          <div className="grid gap-4 sm:grid-cols-3"><Experience icon={Target} title="Técnica específica" text="Repeticiones enfocadas en lectura, posicionamiento y reacción." /><Experience icon={Users} title="Grupos reducidos" text="Atención real, retos competitivos y feedback accionable." /><Experience icon={Clock3} title="Dos días intensivos" text="Entrenamiento construido para llevarte al siguiente nivel." /></div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-12"><Card className="relative mx-auto max-w-6xl overflow-hidden border-pitch-400/25 bg-dark-800/80 p-8 shadow-2xl shadow-pitch-500/10 sm:p-12"><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-pitch-500/20 blur-3xl" /><div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" /><div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-gold-400">Club One · USA Goalkeeper Tour</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[.95] text-white sm:text-6xl">El próximo disparo<br /><span className="text-gradient">es tuyo.</span></h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/60">Elige tu ciudad, completa el registro y forma parte de la gira 2026.</p></div><Button size="lg" onClick={scrollToStops} className="h-14 shrink-0 bg-gold-400 px-7 text-base font-bold text-dark-900 hover:bg-gold-300">Quiero mi lugar <ArrowRight className="ml-2 h-5 w-5" /></Button></div></Card></section>

      <footer className="border-t border-white/10 px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-white/40 sm:flex-row"><p>© {new Date().getFullYear()} Club One by HUTEC · USA Goalkeeper Tour 2026</p><Link href="/login" className="transition hover:text-pitch-400">Acceso para clubes</Link></div></footer>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return <div className="p-3 text-center sm:p-4"><p className="font-display text-2xl font-bold text-white">{value}</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.13em] text-white/40">{label}</p></div>;
}

function Ticker({ icon: Icon, text }: { icon: typeof CalendarDays; text: string }) {
  return <div className="flex items-center justify-center gap-2 text-center text-xs font-semibold tracking-wide text-white/55"><Icon className="h-4 w-4 shrink-0 text-pitch-400" />{text}</div>;
}

function Experience({ icon: Icon, title, text }: { icon: typeof Target; title: string; text: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><span className="grid h-11 w-11 place-items-center rounded-xl border border-pitch-400/25 bg-pitch-500/10 text-pitch-400"><Icon className="h-5 w-5" /></span><h3 className="mt-6 font-display text-xl font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{text}</p><Check className="mt-6 h-4 w-4 text-gold-400" /></div>;
}

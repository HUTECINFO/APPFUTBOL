"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ExternalLink,
  FileSignature,
  Goal,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Locale = "es" | "en";

type RegistrationLinks = {
  elPaso: string;
  dallasFortWorth: string;
  houston: string;
  sanAntonio: string;
};

type TourStop = {
  key: keyof RegistrationLinks;
  number: string;
  city: string;
  state: string;
  date: Record<Locale, string>;
  shortDate: Record<Locale, string>;
};

const stops: TourStop[] = [
  {
    key: "elPaso",
    number: "01",
    city: "El Paso",
    state: "TX",
    date: { en: "September 19–20, 2026", es: "19–20 de septiembre de 2026" },
    shortDate: { en: "SEP 19–20", es: "19–20 SEP" },
  },
  {
    key: "dallasFortWorth",
    number: "02",
    city: "Dallas–Fort Worth",
    state: "TX",
    date: { en: "October 3–4, 2026", es: "3–4 de octubre de 2026" },
    shortDate: { en: "OCT 03–04", es: "03–04 OCT" },
  },
  {
    key: "houston",
    number: "03",
    city: "Houston",
    state: "TX",
    date: { en: "October 17–18, 2026", es: "17–18 de octubre de 2026" },
    shortDate: { en: "OCT 17–18", es: "17–18 OCT" },
  },
  {
    key: "sanAntonio",
    number: "04",
    city: "San Antonio",
    state: "TX",
    date: { en: "October 31–November 1, 2026", es: "31 de octubre–1 de noviembre de 2026" },
    shortDate: { en: "OCT 31–NOV 01", es: "31 OCT–01 NOV" },
  },
];

const stepIcons = [UserRound, FileSignature, CreditCard];

const copy = {
  es: {
    language: "Idioma",
    registerNow: "REGÍSTRATE AHORA",
    register: "REGÍSTRATE",
    autumn: "Texas · Otoño 2026",
    hero: "Dos días de entrenamiento específico para porteros, repeticiones competitivas y desarrollo por posición. Cuatro paradas en Texas. Sesenta porteros por ciudad.",
    texasCities: "Ciudades en Texas",
    perGoalkeeper: "Por portero",
    spotsPerCity: "Lugares por ciudad",
    trainingDays: "Días de entrenamiento",
    chooseCity: "ELIGE TU CIUDAD",
    selectLocation: "Selecciona la sede de tu clínica",
    chooseStop: "Elige tu parada",
    capacity: "La inscripción y el cupo se administran por separado en cada ciudad. Tu lugar se reserva únicamente después de aprobarse el pago de $350.",
    stop: "PARADA",
    selectCity: "SELECCIONAR SEDE",
    registrationSoon: "Completar registro",
    pendingLink: "Completa tu solicitud de inscripción con Club One",
    selectCityAria: "Seleccionar",
    registerFor: "Registrarme para la clínica de",
    selected: "Seleccionado:",
    selectionHint: "Selecciona una ciudad para continuar con tu registro.",
    quickRegistration: "Registro con Club One",
    whatYouNeed: "Lo que necesitas",
    guardianText: "El formulario debe ser completado por el padre, madre o tutor legal. Ten a la mano los datos del jugador, información de emergencia, comprobante de seguro y una tarjeta de pago.",
    steps: [
      { title: "Datos del jugador", body: "Información del portero, nivel de experiencia, tallas y notas médicas." },
      { title: "Autorización del tutor", body: "Contacto del tutor, exenciones del evento, consentimiento médico y firma electrónica." },
      { title: "Pago seguro", body: "Paga la inscripción de $350 con tarjeta. Tu lugar se confirma al aprobarse el pago." },
    ],
    paymentTitle: "Tu solicitud queda registrada al enviar el formulario.",
    paymentText: "Club One te contactará con la confirmación, información del evento y los siguientes pasos de pago.",
    limited: "Limitado a 60 porteros por ciudad",
    finalCta: "¿Listo para dominar tu área?",
    footer: "© 2026 Club One by HUTEC. USA Goalkeeper Tour.",
    legal: "Las fechas y sedes están sujetas a confirmación final. Las exenciones de responsabilidad y políticas del evento deben ser revisadas por un abogado autorizado en Texas antes de abrir las inscripciones.",
  },
  en: {
    language: "Language",
    registerNow: "REGISTER NOW",
    register: "REGISTER",
    autumn: "Texas · Fall 2026",
    hero: "Two days of focused goalkeeper training, competitive reps, and position-specific development. Four Texas stops. Sixty keepers per city.",
    texasCities: "Texas cities",
    perGoalkeeper: "Per goalkeeper",
    spotsPerCity: "Spots per city",
    trainingDays: "Training days",
    chooseCity: "CHOOSE YOUR CITY",
    selectLocation: "Select your clinic location",
    chooseStop: "Choose your stop",
    capacity: "Registration and capacity are managed separately for every city. Your spot is held only after the $350 payment is approved.",
    stop: "STOP",
    selectCity: "SELECT LOCATION",
    registrationSoon: "Complete registration",
    pendingLink: "Complete your registration request with Club One",
    selectCityAria: "Select",
    registerFor: "Register for the",
    selected: "Selected:",
    selectionHint: "Select a city to continue with your registration.",
    quickRegistration: "Registration with Club One",
    whatYouNeed: "What you’ll need",
    guardianText: "A parent or legal guardian must complete the form. Have player details, emergency information, insurance confirmation, and a payment card ready.",
    steps: [
      { title: "Player details", body: "Goalkeeper information, experience level, sizes, and medical notes." },
      { title: "Parent approval", body: "Guardian contact, event waivers, medical consent, and e-signature." },
      { title: "Secure payment", body: "Pay the $350 registration fee by card. Your spot is confirmed after approval." },
    ],
    paymentTitle: "Your request is recorded when you submit the form.",
    paymentText: "Club One will contact you with confirmation, event information, and next payment steps.",
    limited: "Limited to 60 goalkeepers per city",
    finalCta: "Ready to own your box?",
    footer: "© 2026 Club One by HUTEC. USA Goalkeeper Tour.",
    legal: "Dates and venues are subject to final confirmation. Participation waivers and event policies should be reviewed by a Texas-licensed attorney before registration opens.",
  },
} as const;

function scrollToLocations() {
  document.getElementById("locations")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function RegistrationLink({
  stop,
  href,
  fallbackHref,
  locale,
}: {
  stop: TourStop;
  href: string;
  fallbackHref: string;
  locale: Locale;
}) {
  const text = copy[locale];
  const destination = href || fallbackHref;
  const isExternal = Boolean(href);

  return (
    <a
      href={destination}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group inline-flex h-12 w-full items-center justify-center rounded-xl bg-lime-300 px-5 text-sm font-extrabold tracking-wide text-dark-900 transition hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
      aria-label={`${text.registerFor} ${stop.city}`}
    >
      {text.selectCity}
      {isExternal ? <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> : <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
    </a>
  );
}

export function GoalkeeperTourPage({ registrationLinks }: { registrationLinks: RegistrationLinks }) {
  const [locale, setLocale] = useState<Locale>("es");
  const [selectedStop, setSelectedStop] = useState<TourStop | null>(null);
  const text = copy[locale];

  return (
    <main
      id="contenido-principal"
      lang={locale}
      className="relative min-h-screen overflow-hidden bg-[#070b09] text-white selection:bg-lime-300 selection:text-dark-900"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-22rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-lime-300/[0.11] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-[#070b09]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-3" aria-label="USA Goalkeeper Tour home">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-lime-300/30 bg-lime-300/10">
              <Goal className="h-5 w-5 text-lime-300" />
            </span>
            <span><span className="block font-display text-lg font-bold leading-none tracking-wide">CLUB <span className="text-lime-300">ONE</span></span><span className="mt-1 block text-[9px] font-bold tracking-[0.28em] text-white/45">BY HUTEC</span></span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex rounded-lg border border-white/15 p-1" role="group" aria-label={text.language}>
              {(["es", "en"] as Locale[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLocale(option)}
                  aria-pressed={locale === option}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-extrabold tracking-wider transition sm:px-2.5",
                    locale === option ? "bg-white text-dark-900" : "text-white/55 hover:text-white"
                  )}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <Button type="button" onClick={scrollToLocations} className="h-11 rounded-xl bg-lime-300 px-3 font-extrabold tracking-wide text-dark-900 hover:bg-lime-200 sm:px-6">
              <span className="hidden sm:inline">{text.registerNow}</span>
              <span className="sm:hidden">{text.register}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section id="top" className="relative z-10 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mb-8 flex items-center gap-3">
            <span className="h-px w-8 bg-lime-300" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-lime-300">{text.autumn}</span>
          </motion.div>

          <div className="grid items-end gap-12 lg:grid-cols-[1.5fr_.8fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}>
              <h1 className="max-w-5xl font-display text-[clamp(3.5rem,10vw,8.75rem)] font-bold uppercase leading-[0.82] tracking-[-0.035em]">
                USA
                <span className="block text-lime-300">Goalkeeper</span>
                <span className="flex items-end gap-4">Tour <span className="mb-[0.06em] font-sans text-[0.22em] font-extrabold tracking-[0.08em] text-white/45">2026</span></span>
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">{text.hero}</p>
            </motion.div>

            <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.18 }} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30">
              <div className="grid grid-cols-2 divide-x divide-y divide-white/10">
                <Stat icon={MapPin} value="04" label={text.texasCities} />
                <Stat icon={CircleDollarSign} value="$350" label={text.perGoalkeeper} />
                <Stat icon={Users} value="60" label={text.spotsPerCity} />
                <Stat icon={Clock3} value="02" label={text.trainingDays} />
              </div>
              <button type="button" onClick={scrollToLocations} className="group flex w-full items-center justify-between border-t border-white/10 bg-lime-300 px-6 py-5 text-left text-sm font-extrabold tracking-wide text-dark-900 transition hover:bg-lime-200">
                {text.chooseCity}
                <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
              </button>
            </motion.aside>
          </div>
        </div>
      </section>

      <section id="locations" className="relative z-10 scroll-mt-20 border-t border-white/10 bg-[#0a100d] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-lime-300">{text.selectLocation}</p>
              <h2 className="font-display text-4xl font-bold uppercase leading-none sm:text-6xl">{text.chooseStop}</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/50">{text.capacity}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stops.map((stop, index) => {
              const isSelected = selectedStop?.key === stop.key;
              return (
                <motion.article key={stop.key} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.4, delay: index * 0.06 }} className={cn("relative flex min-h-[22rem] flex-col overflow-hidden rounded-[1.5rem] border bg-[#0d1511] p-6 transition", isSelected ? "border-lime-300 shadow-[0_0_0_1px_rgba(190,242,100,.25),0_24px_80px_rgba(0,0,0,.35)]" : "border-white/10 hover:-translate-y-1 hover:border-white/25")}>
                  <button type="button" onClick={() => setSelectedStop(stop)} className="absolute inset-0 z-0 cursor-pointer rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-300" aria-label={`${text.selectCityAria} ${stop.city}, Texas`} />
                  <div className="pointer-events-none relative z-10 flex items-start justify-between">
                    <span className="font-display text-sm font-bold tracking-[0.16em] text-white/30">{text.stop} {stop.number}</span>
                    <span className={cn("grid h-7 w-7 place-items-center rounded-full border", isSelected ? "border-lime-300 bg-lime-300 text-dark-900" : "border-white/15 text-transparent")}><Check className="h-4 w-4" /></span>
                  </div>
                  <div className="pointer-events-none relative z-10 my-auto py-8">
                    <p className="mb-3 font-display text-sm font-bold tracking-[0.15em] text-lime-300">{stop.shortDate[locale]}</p>
                    <h3 className="font-display text-4xl font-bold uppercase leading-[0.95]">{stop.city}</h3>
                    <p className="mt-2 text-sm font-semibold tracking-[0.18em] text-white/35">{stop.state}</p>
                  </div>
                  <div className="relative z-10">
                    <div className="mb-5 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-white/50"><CalendarDays className="h-4 w-4 text-lime-300" />{stop.date[locale]}</div>
                    {isSelected ? <RegistrationLink stop={stop} href={registrationLinks[stop.key]} fallbackHref={`/inscripcion/usa-goalkeeper-tour-2026?sede=${stop.key}`} locale={locale} /> : <span className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-bold text-white/65">{text.selectCity}</span>}
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div aria-live="polite" className="mt-5 min-h-6 text-center text-xs text-white/35">
            {selectedStop ? <span>{text.selected} <strong className="font-semibold text-white/65">{selectedStop.city}, TX · {selectedStop.date[locale]}</strong></span> : text.selectionHint}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-300"><Sparkles className="h-3.5 w-3.5" /> {text.quickRegistration}</span>
              <h2 className="font-display text-4xl font-bold uppercase leading-[0.95] sm:text-6xl">{text.whatYouNeed}</h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/50">{text.guardianText}</p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {text.steps.map((step, index) => {
                const Icon = stepIcons[index];
                return <div key={step.title} className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-6"><span className="text-xs font-bold tracking-[0.16em] text-white/25">{String(index + 1).padStart(2, "0")}</span><div><h3 className="flex items-center gap-3 font-display text-xl font-bold uppercase"><Icon className="h-5 w-5 text-lime-300" />{step.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-white/45">{step.body}</p></div><Check className="hidden h-5 w-5 text-lime-300 sm:block" /></div>;
              })}
            </div>
          </div>

          <div className="mt-16 grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-lime-300/10 text-lime-300"><ShieldCheck className="h-6 w-6" /></span>
            <div><p className="font-semibold text-white/85">{text.paymentTitle}</p><p className="mt-1 text-xs leading-5 text-white/40">{text.paymentText}</p></div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-lime-300 px-5 py-16 text-dark-900 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.24em] opacity-60">{text.limited}</p><h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none sm:text-6xl">{text.finalCta}</h2></div>
          <button type="button" onClick={scrollToLocations} className="group inline-flex h-14 shrink-0 items-center justify-center rounded-xl bg-dark-900 px-7 text-sm font-extrabold tracking-wide text-white transition hover:bg-dark-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 focus-visible:ring-offset-2 focus-visible:ring-offset-lime-300">{text.registerNow}<ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" /></button>
        </div>
      </section>

      <footer className="relative z-10 px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-xs text-white/35 sm:flex-row sm:items-center"><p>{text.footer}</p><p className="max-w-xl sm:text-right">{text.legal}</p></div>
      </footer>
    </main>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof MapPin; value: string; label: string }) {
  return <div className="p-5 sm:p-6"><Icon className="mb-6 h-5 w-5 text-lime-300" /><p className="font-display text-4xl font-bold">{value}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">{label}</p></div>;
}

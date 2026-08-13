import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { esClubEvento, EVENTO_TOUR, formatUsd } from "@/lib/evento-tour";
import { PagoPruebaForm } from "@/components/inscripcion/pago-prueba-form";
import { CreditCard, Goal, MapPin, ShieldCheck } from "lucide-react";

export default async function PagoPruebaPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { solicitud?: string };
}) {
  if (!esClubEvento(params.slug)) redirect(`/inscripcion/${params.slug}`);

  // Con Stripe configurado el pago real ocurre en Stripe Checkout.
  if (process.env.STRIPE_SECRET_KEY) redirect(`/inscripcion/${params.slug}`);

  const solicitudId = searchParams?.solicitud;
  const solicitud = solicitudId
    ? await db.solicitudInscripcion.findFirst({
        where: { id: solicitudId, club: { slug: params.slug } },
        include: { equipo: { select: { nombre: true, categoria: true } } },
      })
    : null;

  if (!solicitud || solicitud.jugadorCreadoId) {
    redirect(`/inscripcion/${params.slug}`);
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden px-4 py-10">
      <div aria-hidden className="club-ambient-orb club-ambient-orb--one" />
      <div aria-hidden className="club-ambient-orb club-ambient-orb--two" />

      <div className="relative z-10 w-full max-w-md">
        <header className="mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pitch-400">Paso 2 de 3 · Pago</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">
            <span className="text-gradient">Completa tu inscripción</span>
          </h1>
        </header>

        <div className="matchday-glow relative overflow-hidden rounded-[1.75rem] border border-pitch-400/25 bg-gradient-to-br from-pitch-900 via-dark-800 to-dark-900">
          <div aria-hidden className="pitch-stripes absolute inset-0" />
          <div className="relative p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">
                <CreditCard className="h-3 w-3" /> Modo prueba
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                {EVENTO_TOUR.nombre}
              </span>
            </div>

            <div className="mb-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="pitch-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-pitch-400/40 bg-black/40">
                  <Goal className="h-5 w-5 text-pitch-300" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold uppercase text-white">{solicitud.nombreJugador}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-pitch-300">Portero</p>
                </div>
              </div>
              {solicitud.equipo && (
                <p className="flex items-center gap-1.5 text-xs text-white/50">
                  <MapPin className="h-3.5 w-3.5 text-pitch-400" />
                  {solicitud.equipo.nombre} · {solicitud.equipo.categoria}
                </p>
              )}
            </div>

            <div className="mb-6 flex items-end justify-between border-t border-dashed border-white/15 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Total a pagar</p>
              <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-white">
                {formatUsd(EVENTO_TOUR.precioUsd)} <span className="text-base text-pitch-300">USD</span>
              </p>
            </div>

            <PagoPruebaForm solicitudId={solicitud.id} />

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] uppercase tracking-widest text-white/30">
              <ShieldCheck className="h-3 w-3" /> Entorno de pruebas · no se realiza ningún cargo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

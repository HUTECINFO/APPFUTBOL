import Link from "next/link";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { esClubEvento, EVENTO_TOUR, formatUsd } from "@/lib/evento-tour";
import { confirmarPagoEvento } from "@/lib/evento-inscripcion";
import { CrearClaveForm } from "@/components/inscripcion/crear-clave-form";
import { RetryCheckoutButton } from "@/components/inscripcion/retry-checkout-button";
import { CheckCircle2, Goal, KeyRound, MapPin, XCircle } from "lucide-react";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { session_id?: string; solicitud?: string; cancelado?: string };
}) {
  if (!esClubEvento(params.slug)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel w-full max-w-md rounded-2xl p-8 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold">Página no disponible</h1>
          <p className="text-white/60">Este enlace de confirmación no es válido.</p>
        </div>
      </div>
    );
  }

  if (searchParams?.cancelado) {
    return (
      <Shell>
        <XCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
        <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight">Pago cancelado</h1>
        <p className="mb-6 text-sm text-white/60">
          No se realizó ningún cargo. Tu solicitud sigue registrada: puedes completar el pago cuando quieras
          para reservar tu lugar.
        </p>
        {searchParams.solicitud && (
          <RetryCheckoutButton solicitudId={searchParams.solicitud} />
        )}
        <Link
          href={`/inscripcion/${params.slug}`}
          className="mt-3 block text-center text-xs uppercase tracking-widest text-white/40 underline-offset-4 hover:text-white"
        >
          Volver al registro
        </Link>
      </Shell>
    );
  }

  let solicitudId = searchParams?.solicitud || "";
  let errorPago = "";

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey) {
    const sessionId = searchParams?.session_id;
    if (!sessionId) {
      errorPago = "Falta la referencia del pago.";
    } else {
      try {
        const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });
        const checkout = await stripe.checkout.sessions.retrieve(sessionId);
        if (checkout.payment_status !== "paid") throw new Error("El pago aún no se confirma.");
        solicitudId = checkout.metadata?.solicitudId || "";
        if (!solicitudId) throw new Error("Sesión sin solicitud asociada.");
        await confirmarPagoEvento({
          solicitudId,
          metodoPago: "Stripe",
          referenciaPago: String(checkout.payment_intent || checkout.id),
          montoPagado: Number(checkout.amount_total ?? EVENTO_TOUR.precioUsd * 100) / 100,
        });
      } catch (err: any) {
        errorPago = err.message || "No se pudo verificar el pago.";
      }
    }
  }

  const solicitud = solicitudId
    ? await db.solicitudInscripcion.findFirst({
        where: { id: solicitudId, club: { slug: EVENTO_TOUR.clubSlug } },
        include: { equipo: { select: { nombre: true, categoria: true } } },
      })
    : null;

  if (!solicitud || solicitud.estado !== "APROBADA" || errorPago) {
    return (
      <Shell>
        <XCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
        <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight">No pudimos confirmar tu pago</h1>
        <p className="mb-6 text-sm text-white/60">
          {errorPago || "El pago todavía no aparece como confirmado. Si el cargo se realizó, se reflejará en unos minutos."}
        </p>
        <Link
          href={`/inscripcion/${params.slug}`}
          className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-white/5"
        >
          Volver al registro
        </Link>
      </Shell>
    );
  }

  const tutor = await db.usuario.findUnique({
    where: { email: solicitud.emailTutor },
    select: { password: true },
  });
  const necesitaClave = !tutor?.password;
  const confirmationNumber = solicitud.numeroConfirmacion || `UGT26-${solicitud.id.slice(0, 8).toUpperCase()}`;
  const qrDataUrl = await QRCode.toDataURL(`tour-checkin:${solicitud.id}:${confirmationNumber}`, {
    width: 320,
    margin: 1,
    color: { dark: "#07110b", light: "#ffffff" },
  });

  return (
    <Shell>
      <div className="pitch-glow mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-pitch-400/40 bg-pitch-500/15">
        <CheckCircle2 className="h-10 w-10 text-pitch-300" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pitch-400">Paso 3 de 3 · Confirmado</p>
      <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-none tracking-tight">
        <span className="text-gradient">¡Lugar reservado!</span>
      </h1>

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pitch-400/30 bg-pitch-500/10">
            <Goal className="h-5 w-5 text-pitch-300" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold uppercase text-white">{solicitud.nombreJugador}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-pitch-300">Portero · {formatUsd(solicitud.montoPagado || EVENTO_TOUR.precioUsd)} USD pagados</p>
          </div>
        </div>
        {solicitud.equipo && (
          <p className="flex items-center gap-1.5 text-xs text-white/50">
            <MapPin className="h-3.5 w-3.5 text-pitch-400" />
            {solicitud.equipo.nombre} · {solicitud.equipo.categoria}
          </p>
        )}
        <p className="border-t border-dashed border-white/10 pt-3 text-[10px] uppercase tracking-widest text-white/35">
          Confirmación {confirmationNumber}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white p-3">
        <img src={qrDataUrl} alt={`Código QR de check-in ${confirmationNumber}`} className="mx-auto h-44 w-44" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-dark-900">Presenta este código en el check-in</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs leading-5 text-white/55">
        <p><strong className="text-white/80">Llegada:</strong> 30 minutos antes del horario de inicio.</p>
        <p><strong className="text-white/80">Material:</strong> guantes, ropa de entrenamiento, tachones, botella de agua y protector solar.</p>
        <p><strong className="text-white/80">Dirección y canal:</strong> se publicarán en la app y se enviarán al correo registrado cuando queden confirmados.</p>
      </div>

      <div className="mt-6 text-left">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
          <KeyRound className="h-3.5 w-3.5 text-pitch-400" /> Tu acceso a la app
        </p>
        {necesitaClave ? (
          <>
            <p className="mb-3 text-xs text-white/50">
              Crea la contraseña para tu cuenta <span className="font-semibold text-white">{solicitud.emailTutor}</span>.
              Desde la app verás la información del evento, avisos del staff y a tu portero.
            </p>
            <CrearClaveForm
              solicitudId={solicitud.id}
              sessionId={searchParams?.session_id}
              email={solicitud.emailTutor}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-sm text-white/70">
              Ya tienes una cuenta con <span className="font-semibold text-white">{solicitud.emailTutor}</span>.
            </p>
            <Link
              href="/login"
              className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-pitch-500 to-pitch-400 font-display text-sm font-bold uppercase tracking-[0.15em] text-dark-900 transition-transform active:scale-[0.98]"
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden px-4 py-10">
      <div aria-hidden className="club-ambient-orb club-ambient-orb--one" />
      <div aria-hidden className="club-ambient-orb club-ambient-orb--two" />
      <div className="glass-panel relative z-10 w-full max-w-md p-6 text-center sm:p-8">{children}</div>
    </div>
  );
}

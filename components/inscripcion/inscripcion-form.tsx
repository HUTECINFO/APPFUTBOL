"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ShieldCheck, Users, Goal, CreditCard, KeyRound, ClipboardList, Lock } from "lucide-react";
import { WAIVER_TEXT, WAIVER_VERSION } from "@/lib/waiver";
import { brandCssVariables } from "@/lib/theme";
import { EVENTO_TOUR, esClubEvento, formatUsd } from "@/lib/evento-tour";

interface Equipo {
  id: string;
  nombre: string;
  categoria: string;
  genero: string;
  cupoMaximo: number | null;
  _count: { jugadores: number };
}

interface Club {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  equipos: Equipo[];
}

const emptyForm = {
  equipoId: "__none",
  nombreJugador: "",
  fechaNacimiento: "",
  posicion: "",
  nombreTutor: "",
  emailTutor: "",
  telefonoTutor: "",
  parentesco: "",
  waiverAceptado: false,
};

function cupoLabel(equipo: Equipo) {
  if (equipo.cupoMaximo === null) return null;
  const disponibles = equipo.cupoMaximo - equipo._count.jugadores;
  if (disponibles <= 0) return "Lista de espera";
  return `${disponibles} lugar${disponibles === 1 ? "" : "es"} disponible${disponibles === 1 ? "" : "s"}`;
}

const pasosEvento = [
  { icon: ClipboardList, label: "Registro" },
  { icon: CreditCard, label: "Pago" },
  { icon: KeyRound, label: "Acceso" },
];

export function InscripcionForm({ club, initialEquipoId }: { club: Club; initialEquipoId?: string }) {
  const esEvento = esClubEvento(club.slug);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    equipoId: initialEquipoId || emptyForm.equipoId,
    posicion: esEvento ? EVENTO_TOUR.posicionFija : "",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<"PENDIENTE" | "LISTA_ESPERA" | null>(null);

  const themeVars = brandCssVariables({
    colorPrimario: club.colorPrimario,
    colorSecundario: club.colorSecundario,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.waiverAceptado) {
      setError("Debes aceptar el consentimiento para continuar.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/public/clubs/${club.slug}/solicitudes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          waiverVersion: WAIVER_VERSION,
          equipoId: form.equipoId === "__none" ? undefined : form.equipoId,
          posicion: (esEvento ? EVENTO_TOUR.posicionFija : form.posicion) || undefined,
          telefonoTutor: form.telefonoTutor || undefined,
          parentesco: form.parentesco || undefined,
          fechaNacimiento: form.fechaNacimiento,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar la solicitud");

      if (!esEvento) {
        setResultado(data.estado);
        return;
      }

      if (form.equipoId === "__none") {
        throw new Error("Selecciona la sede de tu clínica para continuar al pago.");
      }

      const checkout = await fetch("/api/public/evento/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId: data.id }),
      });
      const checkoutData = await checkout.json();
      if (!checkout.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || "No se pudo iniciar el pago");
      }
      window.location.assign(checkoutData.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la solicitud");
      setLoading(false);
    }
  };

  if (resultado) {
    return (
      <div id="contenido-principal" className="min-h-screen flex items-center justify-center px-6" style={themeVars}>
        <Card className="glass-panel w-full max-w-lg p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-pitch-400 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">
            {resultado === "LISTA_ESPERA" ? "Quedaste en lista de espera" : "¡Solicitud enviada!"}
          </h1>
          <p className="text-white/60">
            {resultado === "LISTA_ESPERA"
              ? `El equipo seleccionado ya alcanzó su cupo. ${club.nombre} se pondrá en contacto contigo si se libera un lugar.`
              : `${club.nombre} revisará tu solicitud y te contactará por correo o teléfono para confirmar la inscripción.`}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      id="contenido-principal"
      className="relative min-h-[100dvh] overflow-x-hidden px-4 py-8 sm:py-12"
      style={themeVars}
    >
      <div aria-hidden className="club-ambient-orb club-ambient-orb--one" />
      <div aria-hidden className="club-ambient-orb club-ambient-orb--two" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative z-10 mx-auto w-full max-w-md"
      >
        <header className="mb-6 text-center">
          {club.logoUrl && (
            <img src={club.logoUrl} alt={club.nombre} className="mx-auto mb-3 h-16 w-16 rounded-2xl border border-white/10 object-cover" />
          )}
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pitch-400">
            {esEvento ? "Texas · Otoño 2026" : "Formulario de inscripción"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-tight tracking-tight">
            <span className="text-gradient">{esEvento ? "USA Goalkeeper Tour" : club.nombre}</span>
          </h1>
          {esEvento && (
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/40">Club One by HUTEC</p>
          )}
        </header>

        {esEvento && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="matchday-glow relative mb-5 overflow-hidden rounded-[1.75rem] border border-pitch-400/25 bg-gradient-to-br from-pitch-900 via-dark-800 to-dark-900"
          >
            <div aria-hidden className="pitch-stripes absolute inset-0" />
            <div className="relative flex items-center justify-between p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Inscripción por portero</p>
                <p className="mt-1 font-display text-4xl font-bold tracking-tight text-white">
                  {formatUsd(EVENTO_TOUR.precioUsd)} <span className="text-lg text-pitch-300">USD</span>
                </p>
                <p className="mt-1 text-xs text-white/50">Pago único · tu lugar se confirma al pagar</p>
              </div>
              <div className="pitch-glow flex h-14 w-14 items-center justify-center rounded-2xl border border-pitch-400/40 bg-black/40">
                <Goal className="h-7 w-7 text-pitch-300" />
              </div>
            </div>
            <div className="relative grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
              {pasosEvento.map((paso, i) => {
                const Icon = paso.icon;
                return (
                  <div key={paso.label} className="flex flex-col items-center gap-1 py-3">
                    <Icon className={`h-4 w-4 ${i === 0 ? "text-pitch-300" : "text-white/35"}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${i === 0 ? "text-pitch-300" : "text-white/35"}`}>
                      {i + 1}. {paso.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        <Card className="glass-panel p-5 sm:p-7">
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                {esEvento ? "Sede / Ciudad" : "Equipo"}
              </Label>
              <Select value={form.equipoId} onValueChange={(v) => setForm({ ...form, equipoId: v })}>
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5">
                  <SelectValue placeholder={esEvento ? "Selecciona tu sede" : "Selecciona un equipo"} />
                </SelectTrigger>
                <SelectContent>
                  {!esEvento && <SelectItem value="__none">Sin preferencia / que el club asigne</SelectItem>}
                  {club.equipos.map((eq) => {
                    const label = cupoLabel(eq);
                    return (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.nombre} · {eq.categoria} {label ? `— ${label}` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {esEvento ? "Nombre del portero" : "Nombre del jugador"}
                </Label>
                <Input
                  value={form.nombreJugador}
                  onChange={(e) => setForm({ ...form, nombreJugador: e.target.value })}
                  required
                  className="h-12 rounded-2xl border-white/10 bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                  required
                  className="h-12 rounded-2xl border-white/10 bg-white/5"
                />
              </div>
            </div>

            {esEvento ? (
              <div className="flex items-center justify-between rounded-2xl border border-pitch-400/25 bg-pitch-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Goal className="h-4 w-4 text-pitch-300" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-pitch-300">Portero</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Única posición del evento</p>
                  </div>
                </div>
                <Lock className="h-3.5 w-3.5 text-white/30" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Posición (opcional)</Label>
                <Select value={form.posicion} onValueChange={(v) => setForm({ ...form, posicion: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Portero">Portero</SelectItem>
                    <SelectItem value="Defensa">Defensa</SelectItem>
                    <SelectItem value="Mediocampista">Mediocampista</SelectItem>
                    <SelectItem value="Delantero">Delantero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="border-t border-white/10 pt-2">
              <p className="mb-4 mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                <Users className="h-4 w-4" /> Datos del tutor / responsable
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Nombre completo</Label>
                  <Input
                    value={form.nombreTutor}
                    onChange={(e) => setForm({ ...form, nombreTutor: e.target.value })}
                    required
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Parentesco (opcional)</Label>
                  <Input
                    value={form.parentesco}
                    onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
                    placeholder="Ej. Papá, Mamá, Tutor"
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Correo electrónico</Label>
                  <Input
                    type="email"
                    value={form.emailTutor}
                    onChange={(e) => setForm({ ...form, emailTutor: e.target.value })}
                    required
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                  {esEvento && (
                    <p className="text-[10px] text-white/35">Con este correo crearás tu acceso después del pago.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Teléfono (opcional)</Label>
                  <Input
                    value={form.telefonoTutor}
                    onChange={(e) => setForm({ ...form, telefonoTutor: e.target.value })}
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-white">
                <ShieldCheck className="h-4 w-4 text-pitch-400" /> Consentimiento
              </p>
              <p className="text-xs leading-relaxed text-white/50">{WAIVER_TEXT}</p>
              <p className="text-xs text-white/30">Versión del consentimiento: {WAIVER_VERSION}</p>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-white/80">
                <Checkbox
                  checked={form.waiverAceptado}
                  onCheckedChange={(v) => setForm({ ...form, waiverAceptado: v === true })}
                />
                Acepto el consentimiento anterior.
              </label>
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-pitch-500 to-pitch-400 font-display text-sm font-bold uppercase tracking-[0.15em] text-dark-900 transition-transform hover:from-pitch-400 hover:to-pitch-300 active:scale-[0.98]"
              disabled={loading}
            >
              {loading
                ? esEvento ? "Abriendo pago seguro..." : "Enviando..."
                : esEvento
                  ? `Continuar al pago · ${formatUsd(EVENTO_TOUR.precioUsd)} USD`
                  : "Enviar solicitud"}
            </Button>
            {esEvento && (
              <p className="text-center text-[10px] uppercase tracking-widest text-white/30">
                Pago seguro con tarjeta · Precio en dólares americanos (USD)
              </p>
            )}
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

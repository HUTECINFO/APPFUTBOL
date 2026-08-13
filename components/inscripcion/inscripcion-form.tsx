"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Goal } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENTO_TOUR, esClubEvento, formatUsd } from "@/lib/evento-tour";
import { brandCssVariables } from "@/lib/theme";
import { TOUR_AUTHORIZATIONS, WAIVER_TEXT, WAIVER_VERSION } from "@/lib/waiver";

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
  categoriaNacimiento: "",
  clubActual: "",
  anosPortero: "",
  nivel: "",
  tallaJersey: "",
  tallaGuantes: "",
  ciudadResidencia: "",
  lesionesCondiciones: "",
  posicion: "",
  nombreTutor: "",
  emailTutor: "",
  telefonoTutor: "",
  parentesco: "",
  direccionTutor: "",
  contactoEmergenciaNombre: "",
  contactoEmergenciaTelefono: "",
  contactoEmergenciaRelacion: "",
  seguroMedicoConfirmado: false,
  seguroMedicoProveedor: "",
  waiverResponsabilidad: false,
  autorizacionMedica: false,
  autorizacionImagen: false,
  politicaCancelacion: false,
  codigoConducta: false,
  firmaTutor: "",
  waiverAceptado: false,
};

const EVENT_STEPS = ["Jugador y ciudad", "Tutor y emergencia", "Experiencia y tallas", "Autorizaciones", "Revisión y pago"];

function cupoLabel(equipo: Equipo) {
  if (equipo.cupoMaximo === null) return null;
  const disponibles = equipo.cupoMaximo - equipo._count.jugadores;
  return disponibles <= 0 ? "Lista de espera" : `${disponibles} lugares disponibles`;
}

function edadDesde(fecha: string) {
  if (!fecha) return null;
  const nacimiento = new Date(`${fecha}T12:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

export function InscripcionForm({ club, initialEquipoId }: { club: Club; initialEquipoId?: string }) {
  const esEvento = esClubEvento(club.slug);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    equipoId: initialEquipoId || emptyForm.equipoId,
    posicion: esEvento ? EVENTO_TOUR.posicionFija : "",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<"PENDIENTE" | "LISTA_ESPERA" | null>(null);
  const edad = useMemo(() => edadDesde(form.fechaNacimiento), [form.fechaNacimiento]);
  const equipo = club.equipos.find((item) => item.id === form.equipoId);
  const themeVars = brandCssVariables({ colorPrimario: club.colorPrimario, colorSecundario: club.colorSecundario });

  const fail = (message: string) => {
    setError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return false;
  };

  const validateStep = () => {
    setError("");
    if (!esEvento) return true;
    if (step === 0 && (form.equipoId === "__none" || !form.nombreJugador.trim() || !form.fechaNacimiento || !form.categoriaNacimiento.trim() || !form.ciudadResidencia.trim())) {
      return fail("Completa la sede y todos los datos obligatorios del portero.");
    }
    if (step === 1 && (!form.nombreTutor.trim() || !form.emailTutor.trim() || !form.telefonoTutor.trim() || !form.parentesco.trim() || !form.direccionTutor.trim() || !form.contactoEmergenciaNombre.trim() || !form.contactoEmergenciaTelefono.trim() || !form.contactoEmergenciaRelacion.trim())) {
      return fail("Completa los datos del tutor y del contacto de emergencia.");
    }
    if (step === 2 && (!form.clubActual.trim() || form.anosPortero === "" || !form.nivel || !form.tallaJersey || !form.tallaGuantes || !form.seguroMedicoConfirmado || !form.seguroMedicoProveedor.trim())) {
      return fail("Completa la experiencia, las tallas y la información del seguro médico.");
    }
    if (step === 3) {
      const accepted = form.waiverResponsabilidad && form.autorizacionMedica && form.autorizacionImagen && form.politicaCancelacion && form.codigoConducta;
      if (!accepted || !form.firmaTutor.trim()) return fail("Acepta todas las autorizaciones y escribe la firma electrónica del tutor.");
      if (form.firmaTutor.trim().toLocaleLowerCase() !== form.nombreTutor.trim().toLocaleLowerCase()) {
        return fail("La firma electrónica debe coincidir con el nombre completo del tutor.");
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(EVENT_STEPS.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/public/clubs/${club.slug}/solicitudes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          waiverVersion: WAIVER_VERSION,
          waiverAceptado: esEvento ? true : form.waiverAceptado,
          equipoId: form.equipoId === "__none" ? undefined : form.equipoId,
          posicion: (esEvento ? EVENTO_TOUR.posicionFija : form.posicion) || undefined,
          anosPortero: form.anosPortero === "" ? undefined : Number(form.anosPortero),
          telefonoTutor: form.telefonoTutor || undefined,
          parentesco: form.parentesco || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar la solicitud");

      if (!esEvento || data.estado === "LISTA_ESPERA") {
        setResultado(data.estado);
        setLoading(false);
        return;
      }

      const checkout = await fetch("/api/public/evento/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId: data.id }),
      });
      const checkoutData = await checkout.json();
      if (!checkout.ok || !checkoutData.url) {
        if (checkoutData.listaEspera) {
          setResultado("LISTA_ESPERA");
          setLoading(false);
          return;
        }
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
      <div className="flex min-h-screen items-center justify-center px-6" style={themeVars}>
        <Card className="glass-panel w-full max-w-lg p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-pitch-400" />
          <h1 className="mb-2 font-display text-2xl font-bold">{resultado === "LISTA_ESPERA" ? "Estás en lista de espera" : "¡Solicitud enviada!"}</h1>
          <p className="text-sm text-white/60">
            {resultado === "LISTA_ESPERA"
              ? `La sede seleccionada alcanzó sus 60 pagos o reservas activas. No se realizó ningún cobro; te contactaremos si se libera un lugar.`
              : `${club.nombre} revisará tu solicitud y te contactará por correo o teléfono.`}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden px-4 py-8 sm:py-12" style={themeVars}>
      <div aria-hidden className="club-ambient-orb club-ambient-orb--one" />
      <div aria-hidden className="club-ambient-orb club-ambient-orb--two" />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto w-full max-w-2xl">
        <header className="mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pitch-400">{esEvento ? "Texas · Otoño 2026" : "Formulario de inscripción"}</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase"><span className="text-gradient">{esEvento ? "USA Goalkeeper Tour" : club.nombre}</span></h1>
          {esEvento && <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/40">Club One by HUTEC · {formatUsd(EVENTO_TOUR.precioUsd)} USD</p>}
        </header>

        {esEvento && (
          <div className="mb-5 grid grid-cols-5 gap-1">
            {EVENT_STEPS.map((label, index) => (
              <div key={label} className="min-w-0 text-center">
                <div className={`mx-auto mb-1 h-1.5 rounded-full ${index <= step ? "bg-pitch-400" : "bg-white/10"}`} />
                <span className={`hidden text-[9px] uppercase tracking-wide sm:block ${index === step ? "text-pitch-300" : "text-white/30"}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <Card className="glass-panel p-5 sm:p-7">
          {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            {(!esEvento || step === 0) && (
              <Section title={esEvento ? "1. Ciudad y datos del portero" : "Datos del jugador"}>
                <Field label={esEvento ? "Select your clinic location" : "Equipo"} wide>
                  <Select value={form.equipoId} onValueChange={(value) => setForm({ ...form, equipoId: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {!esEvento && <SelectItem value="__none">Sin preferencia</SelectItem>}
                      {club.equipos.map((item) => <SelectItem key={item.id} value={item.id}>{item.nombre} · {item.categoria} — {cupoLabel(item)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Nombre completo del jugador"><Input value={form.nombreJugador} onChange={(e) => setForm({ ...form, nombreJugador: e.target.value })} /></Field>
                <Field label="Fecha de nacimiento"><Input type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value, categoriaNacimiento: e.target.value ? e.target.value.slice(0, 4) : "" })} /></Field>
                {esEvento && <><Field label="Edad"><Input value={edad === null ? "" : `${edad} años`} disabled /></Field><Field label="Categoría / año de nacimiento"><Input value={form.categoriaNacimiento} onChange={(e) => setForm({ ...form, categoriaNacimiento: e.target.value })} /></Field><Field label="Ciudad de residencia" wide><Input value={form.ciudadResidencia} onChange={(e) => setForm({ ...form, ciudadResidencia: e.target.value })} /></Field></>}
              </Section>
            )}

            {esEvento && step === 1 && (
              <Section title="2. Padre, tutor y emergencia">
                <Field label="Nombre completo"><Input value={form.nombreTutor} onChange={(e) => setForm({ ...form, nombreTutor: e.target.value })} /></Field>
                <Field label="Relación con el jugador"><Input value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} /></Field>
                <Field label="Correo electrónico"><Input type="email" value={form.emailTutor} onChange={(e) => setForm({ ...form, emailTutor: e.target.value })} /></Field>
                <Field label="Teléfono"><Input type="tel" value={form.telefonoTutor} onChange={(e) => setForm({ ...form, telefonoTutor: e.target.value })} /></Field>
                <Field label="Dirección" wide><Input value={form.direccionTutor} onChange={(e) => setForm({ ...form, direccionTutor: e.target.value })} /></Field>
                <Field label="Contacto de emergencia"><Input value={form.contactoEmergenciaNombre} onChange={(e) => setForm({ ...form, contactoEmergenciaNombre: e.target.value })} /></Field>
                <Field label="Teléfono de emergencia"><Input type="tel" value={form.contactoEmergenciaTelefono} onChange={(e) => setForm({ ...form, contactoEmergenciaTelefono: e.target.value })} /></Field>
                <Field label="Relación del contacto" wide><Input value={form.contactoEmergenciaRelacion} onChange={(e) => setForm({ ...form, contactoEmergenciaRelacion: e.target.value })} /></Field>
              </Section>
            )}

            {esEvento && step === 2 && (
              <Section title="3. Experiencia deportiva, tallas y salud">
                <Field label="Club o academia actual"><Input value={form.clubActual} onChange={(e) => setForm({ ...form, clubActual: e.target.value })} /></Field>
                <Field label="Años jugando como portero"><Input type="number" min="0" max="30" value={form.anosPortero} onChange={(e) => setForm({ ...form, anosPortero: e.target.value })} /></Field>
                <Field label="Nivel"><Select value={form.nivel} onValueChange={(value) => setForm({ ...form, nivel: value })}><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger><SelectContent><SelectItem value="PRINCIPIANTE">Principiante</SelectItem><SelectItem value="INTERMEDIO">Intermedio</SelectItem><SelectItem value="AVANZADO">Avanzado</SelectItem></SelectContent></Select></Field>
                <Field label="Talla de jersey"><Select value={form.tallaJersey} onValueChange={(value) => setForm({ ...form, tallaJersey: value })}><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger><SelectContent>{["YS", "YM", "YL", "YXL", "AS", "AM", "AL", "AXL", "A2XL"].map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Talla de guantes"><Select value={form.tallaGuantes} onValueChange={(value) => setForm({ ...form, tallaGuantes: value })}><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger><SelectContent>{["4", "5", "6", "7", "8", "9", "10", "11", "12"].map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Proveedor del seguro médico"><Input value={form.seguroMedicoProveedor} onChange={(e) => setForm({ ...form, seguroMedicoProveedor: e.target.value })} /></Field>
                <Field label="Lesiones, alergias o condiciones médicas" wide><Textarea value={form.lesionesCondiciones} onChange={(e) => setForm({ ...form, lesionesCondiciones: e.target.value })} placeholder="Escribe ‘Ninguna’ si no aplica." /></Field>
                <label className="col-span-full flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"><Checkbox checked={form.seguroMedicoConfirmado} onCheckedChange={(value) => setForm({ ...form, seguroMedicoConfirmado: value === true })} /><span>Confirmo que el participante cuenta con seguro médico vigente.</span></label>
              </Section>
            )}

            {esEvento && step === 3 && (
              <Section title="4. Autorizaciones y firma">
                <p className="col-span-full text-xs leading-5 text-white/50">{WAIVER_TEXT}</p>
                {(Object.entries(TOUR_AUTHORIZATIONS) as Array<[keyof typeof TOUR_AUTHORIZATIONS, { title: string; text: string }]>).map(([key, item]) => (
                  <label key={key} className="col-span-full flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <Checkbox checked={Boolean(form[key])} onCheckedChange={(value) => setForm({ ...form, [key]: value === true })} />
                    <span><strong className="block text-sm text-white">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-white/50">{item.text}</span></span>
                  </label>
                ))}
                <Field label="Firma electrónica del padre o tutor" wide><Input value={form.firmaTutor} onChange={(e) => setForm({ ...form, firmaTutor: e.target.value })} placeholder={form.nombreTutor || "Escribe exactamente tu nombre completo"} /><p className="mt-2 text-[10px] leading-4 text-white/35">Al escribir tu nombre confirmas tu intención de firmar electrónicamente. Versión {WAIVER_VERSION}.</p></Field>
                <p className="col-span-full rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-[11px] leading-5 text-amber-200/70">Los textos legales deben ser revisados por un abogado autorizado en Texas antes de abrir inscripciones al público.</p>
              </Section>
            )}

            {esEvento && step === 4 && (
              <Section title="5. Revisión y pago">
                <Review label="Jugador" value={`${form.nombreJugador} · ${edad ?? "—"} años · ${form.nivel.toLowerCase()}`} />
                <Review label="Clínica" value={`${equipo?.nombre || "—"} · ${equipo?.categoria || ""}`} />
                <Review label="Tutor" value={`${form.nombreTutor} · ${form.emailTutor}`} />
                <Review label="Equipo" value={`${form.clubActual} · Jersey ${form.tallaJersey} · Guantes ${form.tallaGuantes}`} />
                <div className="col-span-full rounded-2xl border border-pitch-400/25 bg-pitch-500/10 p-5">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-semibold"><CreditCard className="h-5 w-5 text-pitch-300" /> Registration Fee</span><strong className="font-display text-2xl text-pitch-300">{formatUsd(EVENTO_TOUR.precioUsd)} USD</strong></div>
                  <p className="mt-3 text-xs leading-5 text-white/50">Stripe mostrará el campo para código promocional. Tu lugar se confirma únicamente cuando el pago sea aprobado. La reserva de cupo dura 30 minutos mientras completas el pago.</p>
                </div>
              </Section>
            )}

            {!esEvento && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Posición"><Select value={form.posicion} onValueChange={(value) => setForm({ ...form, posicion: value })}><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger><SelectContent><SelectItem value="Portero">Portero</SelectItem><SelectItem value="Defensa">Defensa</SelectItem><SelectItem value="Mediocampista">Mediocampista</SelectItem><SelectItem value="Delantero">Delantero</SelectItem></SelectContent></Select></Field>
                <Field label="Nombre del tutor"><Input value={form.nombreTutor} onChange={(e) => setForm({ ...form, nombreTutor: e.target.value })} /></Field>
                <Field label="Correo"><Input type="email" value={form.emailTutor} onChange={(e) => setForm({ ...form, emailTutor: e.target.value })} /></Field>
                <Field label="Teléfono"><Input type="tel" value={form.telefonoTutor} onChange={(e) => setForm({ ...form, telefonoTutor: e.target.value })} /></Field>
                <Field label="Parentesco"><Input value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} /></Field>
                <label className="col-span-full flex gap-3 text-sm"><Checkbox checked={form.waiverAceptado} onCheckedChange={(value) => setForm({ ...form, waiverAceptado: value === true })} />Acepto el consentimiento de inscripción.</label>
              </div>
            )}

            <div className="mt-7 flex gap-3 border-t border-white/10 pt-5">
              {esEvento && step > 0 && <Button type="button" variant="outline" onClick={() => { setError(""); setStep((current) => current - 1); }}><ArrowLeft className="mr-2 h-4 w-4" />Atrás</Button>}
              {esEvento && step < EVENT_STEPS.length - 1 ? (
                <Button type="button" onClick={next} className="ml-auto bg-pitch-500 font-semibold text-dark-900 hover:bg-pitch-400">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
              ) : (
                <Button type="submit" disabled={loading} className="ml-auto bg-pitch-500 font-semibold text-dark-900 hover:bg-pitch-400">
                  {loading ? "Abriendo pago seguro…" : esEvento ? `Pagar ${formatUsd(EVENTO_TOUR.precioUsd)} USD` : "Enviar solicitud"}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold uppercase"><Goal className="h-5 w-5 text-pitch-400" />{title}</h2><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <div className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}><Label className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</Label>{children}</div>;
}

function Review({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</p><p className="mt-1 text-sm text-white/80">{value}</p></div>;
}

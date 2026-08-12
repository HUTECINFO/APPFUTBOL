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
import { CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { WAIVER_TEXT, WAIVER_VERSION } from "@/lib/waiver";
import { brandCssVariables } from "@/lib/theme";

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

export function InscripcionForm({ club, initialEquipoId }: { club: Club; initialEquipoId?: string }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, equipoId: initialEquipoId || emptyForm.equipoId }));
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

    const res = await fetch(`/api/public/clubs/${club.slug}/solicitudes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        waiverVersion: WAIVER_VERSION,
        equipoId: form.equipoId === "__none" ? undefined : form.equipoId,
        posicion: form.posicion || undefined,
        telefonoTutor: form.telefonoTutor || undefined,
        parentesco: form.parentesco || undefined,
        fechaNacimiento: form.fechaNacimiento,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResultado(data.estado);
    } else {
      const data = await res.json();
      setError(data.error || "Error al enviar la solicitud");
    }

    setLoading(false);
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
    <div id="contenido-principal" className="min-h-screen px-6 py-12 flex items-center justify-center" style={themeVars}>
      <Card className="glass-panel w-full max-w-xl p-8">
        <div className="text-center mb-8">
          {club.logoUrl && (
            <img src={club.logoUrl} alt={club.nombre} className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover" />
          )}
          <h1 className="text-2xl font-display font-bold text-gradient mb-1">{club.nombre}</h1>
          <p className="text-white/60">Formulario de inscripción</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Equipo</Label>
            <Select value={form.equipoId} onValueChange={(v) => setForm({ ...form, equipoId: v })}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Selecciona un equipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Sin preferencia / que el club asigne</SelectItem>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del jugador</Label>
              <Input
                value={form.nombreJugador}
                onChange={(e) => setForm({ ...form, nombreJugador: e.target.value })}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de nacimiento</Label>
              <Input
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Posición (opcional)</Label>
            <Select value={form.posicion} onValueChange={(v) => setForm({ ...form, posicion: v })}>
              <SelectTrigger className="bg-white/5 border-white/10">
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

          <div className="pt-2 border-t border-white/10">
            <p className="flex items-center gap-2 text-sm text-white/70 mb-4 mt-4">
              <Users className="w-4 h-4" /> Datos del tutor / responsable
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input
                  value={form.nombreTutor}
                  onChange={(e) => setForm({ ...form, nombreTutor: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Parentesco (opcional)</Label>
                <Input
                  value={form.parentesco}
                  onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
                  placeholder="Ej. Papá, Mamá, Tutor"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input
                  type="email"
                  value={form.emailTutor}
                  onChange={(e) => setForm({ ...form, emailTutor: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono (opcional)</Label>
                <Input
                  value={form.telefonoTutor}
                  onChange={(e) => setForm({ ...form, telefonoTutor: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <ShieldCheck className="w-4 h-4 text-pitch-400" /> Consentimiento
            </p>
            <p className="text-xs text-white/50 leading-relaxed">{WAIVER_TEXT}</p>
            <p className="text-xs text-white/30">Versión del consentimiento: {WAIVER_VERSION}</p>
            <label className="flex items-start gap-3 text-sm text-white/80 cursor-pointer">
              <Checkbox
                checked={form.waiverAceptado}
                onCheckedChange={(v) => setForm({ ...form, waiverAceptado: v === true })}
              />
              Acepto el consentimiento anterior.
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

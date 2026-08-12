"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, User, Shirt, Calendar, ArrowLeft, FileText, X, FileCheck, Droplet, AlertTriangle, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PlayerCard } from "@/components/ui/player-card";
import { Textarea } from "@/components/ui/textarea";

function posicionTier(posicion: string): "bronce" | "plata" | "oro" | "leyenda" {
  const map: Record<string, "bronce" | "plata" | "oro" | "leyenda"> = {
    Portero: "plata",
    Defensa: "bronce",
    Mediocampista: "oro",
    Delantero: "leyenda",
  };
  return map[posicion] || "oro";
}

function calcularEdad(fechaNacimiento: string | Date): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

interface RosterViewProps {
  equipo: any;
  tutores: any[];
  role: string;
  clubId: string;
}

export function RosterView({ equipo, tutores, role, clubId }: RosterViewProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apodo: "",
    posicion: "",
    dorsal: "",
    fechaNacimiento: "",
    tutorId: "",
  });

  const isAdmin = role === "SUPER_ADMIN" || role === "CLUB_ADMIN";
  const isCoach = role === "ENTRENADOR";
  const canEdit = isAdmin || isCoach;

  const [expedienteOpen, setExpedienteOpen] = useState(false);
  const [expedienteJugador, setExpedienteJugador] = useState<any>(null);
  const [expedienteForm, setExpedienteForm] = useState({
    contactoEmergenciaNombre: "",
    contactoEmergenciaTelefono: "",
    alergias: "",
    tipoSangre: "",
    seguroMedicoProveedor: "",
    seguroMedicoPoliza: "",
  });
  const [expedienteDocs, setExpedienteDocs] = useState<{ nombre: string; base64: string; mimeType: string; uploadedAt: string }[]>([]);
  const [expedienteLoading, setExpedienteLoading] = useState(false);

  const openExpediente = (jugador: any) => {
    setExpedienteJugador(jugador);
    setExpedienteForm({
      contactoEmergenciaNombre: jugador.contactoEmergenciaNombre || "",
      contactoEmergenciaTelefono: jugador.contactoEmergenciaTelefono || "",
      alergias: jugador.alergias || "",
      tipoSangre: jugador.tipoSangre || "",
      seguroMedicoProveedor: jugador.seguroMedicoProveedor || "",
      seguroMedicoPoliza: jugador.seguroMedicoPoliza || "",
    });
    setExpedienteDocs((jugador.documentos as any[]) || []);
    setExpedienteOpen(true);
  };

  const MAX_FILE_SIZE = 500 * 1024;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("El archivo excede el límite de 500 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setExpedienteDocs((prev) => [
        ...prev,
        { nombre: file.name, base64, mimeType: file.type, uploadedAt: new Date().toISOString() },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (idx: number) => {
    setExpedienteDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleExpedienteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expedienteJugador) return;
    setExpedienteLoading(true);

    const res = await fetch(`/api/clubs/${clubId}/jugadores/${expedienteJugador.id}/expediente`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...expedienteForm,
        documentos: expedienteDocs,
      }),
    });

    if (res.ok) {
      setExpedienteOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al guardar expediente");
    }

    setExpedienteLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/clubs/${clubId}/equipos/${equipo.id}/jugadores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dorsal: form.dorsal ? parseInt(form.dorsal) : undefined,
        tutorId: form.tutorId === "__none" ? undefined : form.tutorId || undefined,
      }),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ nombre: "", apodo: "", posicion: "", dorsal: "", fechaNacimiento: "", tutorId: "" });
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al agregar jugador");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/club/${clubId}/equipos`}>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold">{equipo.nombre}</h1>
            <p className="text-white/60">
              {equipo.categoria} · {equipo.genero} · Entrenador: {equipo.entrenador?.nombre || "Sin asignar"}
            </p>
          </div>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Agregar jugador
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">Agregar jugador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre completo</Label>
                    <Input
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apodo</Label>
                    <Input
                      value={form.apodo}
                      onChange={(e) => setForm({ ...form, apodo: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Posición</Label>
                    <Select
                      value={form.posicion}
                      onValueChange={(v) => setForm({ ...form, posicion: v })}
                      required
                    >
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
                  <div className="space-y-2">
                    <Label>Dorsal</Label>
                    <Input
                      type="number"
                      value={form.dorsal}
                      onChange={(e) => setForm({ ...form, dorsal: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
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
                <div className="space-y-2">
                  <Label>Tutor</Label>
                  <Select
                    value={form.tutorId}
                    onValueChange={(v) => setForm({ ...form, tutorId: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Sin asignar</SelectItem>
                      {tutores.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nombre} · {t.telefono || t.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Agregando..." : "Agregar jugador"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {equipo.jugadores.length === 0 ? (
        <Card className="glass-panel p-12 text-center">
          <User className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No hay jugadores en el roster</h3>
          <p className="text-white/50 text-sm mt-2">
            {canEdit ? "Agrega el primer jugador al equipo." : "El roster está vacío."}
          </p>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
          className="flex flex-wrap gap-8 justify-center lg:justify-start"
        >
          {equipo.jugadores.map((jugador: any) => {
            const edad = calcularEdad(jugador.fechaNacimiento);
            const rating = Math.min(99, 60 + edad * 2);
            return (
              <motion.div
                key={jugador.id}
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.9 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                className="flex flex-col items-center gap-3"
              >
                <PlayerCard
                  nombre={jugador.apodo || jugador.nombre}
                  posicion={jugador.posicion}
                  dorsal={jugador.dorsal}
                  fotoUrl={jugador.fotoUrl}
                  rating={rating}
                  equipo={equipo.nombre}
                  tier={posicionTier(jugador.posicion)}
                  stats={[
                    { label: "EDAD", value: edad },
                    { label: "DOR", value: jugador.dorsal || 0 },
                  ]}
                />
                {jugador.tutor && (
                  <p className="text-xs text-white/40">Tutor: {jugador.tutor.nombre}</p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-white/50 text-xs mt-1">
                  {jugador.tipoSangre && (
                    <span title={`Tipo de sangre: ${jugador.tipoSangre}`} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                      <Droplet className="w-3 h-3 text-red-400" /> {jugador.tipoSangre}
                    </span>
                  )}
                  {jugador.alergias && (
                    <span title={`Alergias: ${jugador.alergias}`} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                      <AlertTriangle className="w-3 h-3 text-yellow-400" /> Alergias
                    </span>
                  )}
                  {jugador.contactoEmergenciaTelefono && (
                    <span title={`Emergencia: ${jugador.contactoEmergenciaNombre} — ${jugador.contactoEmergenciaTelefono}`} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                      <Phone className="w-3 h-3 text-green-400" /> {jugador.contactoEmergenciaTelefono}
                    </span>
                  )}
                  {jugador.seguroMedicoProveedor && (
                    <span title={`Seguro: ${jugador.seguroMedicoProveedor} / ${jugador.seguroMedicoPoliza || "sin póliza"}`} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                      <ShieldCheck className="w-3 h-3 text-pitch-400" /> {jugador.seguroMedicoProveedor}
                    </span>
                  )}
                  {jugador.documentos && (jugador.documentos as any[]).length > 0 && (
                    <span title={`${(jugador.documentos as any[]).length} documento(s) adjunto(s)`} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                      <FileText className="w-3 h-3 text-blue-400" /> {(jugador.documentos as any[]).length} doc
                    </span>
                  )}
                </div>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openExpediente(jugador)}
                    className="mt-1 border-white/10 hover:bg-white/10 text-xs"
                  >
                    <FileText className="w-3 h-3 mr-1" /> Expediente
                  </Button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Dialog open={expedienteOpen} onOpenChange={(v) => { setExpedienteOpen(v); if (!v) setExpedienteJugador(null); }}>
        <DialogContent className="glass-panel border-white/10 max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              Expediente de {expedienteJugador?.nombre}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpedienteSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contacto de emergencia</Label>
                <Input
                  value={expedienteForm.contactoEmergenciaNombre}
                  onChange={(e) => setExpedienteForm({ ...expedienteForm, contactoEmergenciaNombre: e.target.value })}
                  placeholder="Nombre"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono de emergencia</Label>
                <Input
                  value={expedienteForm.contactoEmergenciaTelefono}
                  onChange={(e) => setExpedienteForm({ ...expedienteForm, contactoEmergenciaTelefono: e.target.value })}
                  placeholder="Teléfono"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de sangre</Label>
                <Input
                  value={expedienteForm.tipoSangre}
                  onChange={(e) => setExpedienteForm({ ...expedienteForm, tipoSangre: e.target.value })}
                  placeholder="Ej. O+"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alergias / condiciones relevantes</Label>
              <Textarea
                value={expedienteForm.alergias}
                onChange={(e) => setExpedienteForm({ ...expedienteForm, alergias: e.target.value })}
                placeholder="Ej. Alergia al polen, asma, etc."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seguro médico (proveedor)</Label>
                <Input
                  value={expedienteForm.seguroMedicoProveedor}
                  onChange={(e) => setExpedienteForm({ ...expedienteForm, seguroMedicoProveedor: e.target.value })}
                  placeholder="Ej. GN"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Póliza</Label>
                <Input
                  value={expedienteForm.seguroMedicoPoliza}
                  onChange={(e) => setExpedienteForm({ ...expedienteForm, seguroMedicoPoliza: e.target.value })}
                  placeholder="Número de póliza"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <Label>Documentos (CURP, acta, ficha médica) <span className="text-xs text-white/40">— máx. 500 KB cada uno</span></Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="bg-white/5 border-white/10 text-sm"
              />
              {expedienteDocs.length === 0 ? (
                <p className="text-xs text-white/40">No hay documentos adjuntos.</p>
              ) : (
                <ul className="space-y-2">
                  {expedienteDocs.map((doc, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm text-white/70 bg-white/5 rounded-lg px-3 py-2">
                      <a href={doc.base64} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pitch-400 truncate">
                        <FileCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate">{doc.nombre}</span>
                      </a>
                      <button type="button" onClick={() => removeDocument(idx)} className="text-red-400 hover:text-red-300 shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
              disabled={expedienteLoading}
            >
              {expedienteLoading ? "Guardando..." : "Guardar expediente"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

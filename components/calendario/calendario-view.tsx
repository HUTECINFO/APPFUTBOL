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
import { Calendar, Plus, MapPin, Clock, Users, Check, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface CalendarioViewProps {
  club: any;
  eventos: any[];
  role: string;
  userId: string;
}

export function CalendarioView({ club, eventos, role, userId }: CalendarioViewProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "ENTRENAMIENTO",
    fecha: "",
    equipoId: "",
    sedeId: "",
    descripcion: "",
    rival: "",
  });

  const canEdit = ["SUPER_ADMIN", "CLUB_ADMIN", "ENTRENADOR"].includes(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/clubs/${club.id}/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sedeId: form.sedeId === "__none" ? undefined : form.sedeId || undefined,
        fecha: new Date(form.fecha).toISOString(),
      }),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ titulo: "", tipo: "ENTRENAMIENTO", fecha: "", equipoId: "", sedeId: "", descripcion: "", rival: "" });
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al crear evento");
    }

    setLoading(false);
  };

  const handleRsvp = async (eventoId: string, jugadorId: string, estado: string) => {
    const res = await fetch(`/api/clubs/${club.id}/eventos/${eventoId}/asistencia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jugadorId, estado }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al confirmar");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Calendario</h1>
          <p className="text-white/60">{club.nombre}</p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo evento
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">Crear evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required className="bg-white/5 border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRENAMIENTO">Entrenamiento</SelectItem>
                        <SelectItem value="PARTIDO">Partido</SelectItem>
                        <SelectItem value="TORNEO">Torneo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha y hora</Label>
                    <Input type="datetime-local" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required className="bg-white/5 border-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Equipo</Label>
                    <Select value={form.equipoId} onValueChange={(v) => setForm({ ...form, equipoId: v })} required>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {club.equipos.map((e: any) => (
                          <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sede</Label>
                    <Select value={form.sedeId} onValueChange={(v) => setForm({ ...form, sedeId: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Sin sede</SelectItem>
                        {club.sedes.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="bg-white/5 border-white/10" />
                </div>
                {form.tipo === "PARTIDO" && (
                  <div className="space-y-2">
                    <Label>Rival</Label>
                    <Input value={form.rival} onChange={(e) => setForm({ ...form, rival: e.target.value })} className="bg-white/5 border-white/10" />
                  </div>
                )}
                <Button type="submit" className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold" disabled={loading}>
                  {loading ? "Creando..." : "Crear evento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {eventos.length === 0 ? (
        <Card className="glass-panel p-12 text-center">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No hay eventos programados</h3>
          <p className="text-white/50 text-sm mt-2">Crea el primer entrenamiento o partido.</p>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="space-y-4"
        >
          {eventos.map((evento) => (
            <motion.div
              key={evento.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-pitch-500/10 flex flex-col items-center justify-center text-pitch-400 border border-pitch-500/20">
                      <span className="text-xs uppercase">{new Date(evento.fecha).toLocaleString("es-MX", { month: "short" })}</span>
                      <span className="text-xl font-display font-bold">{new Date(evento.fecha).getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-display font-semibold">{evento.titulo}</h3>
                        <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">{evento.tipo}</span>
                      </div>
                      <p className="text-sm text-white/50">{evento.equipo.nombre}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDateTime(evento.fecha)}</span>
                        {evento.sede && (
                          evento.sede.googleMapsUrl ? (
                            <a
                              href={evento.sede.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-pitch-400 hover:text-pitch-300"
                            >
                              <MapPin className="w-4 h-4" /> {evento.sede.nombre}
                            </a>
                          ) : (
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {evento.sede.nombre}</span>
                          )
                        )}
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {evento.asistencias.length} respuestas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60 mr-2">Asistencia:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      onClick={() => handleRsvp(evento.id, evento.equipo.jugadores[0]?.id, "CONFIRMADO")}
                    >
                      <Check className="w-4 h-4 mr-1" /> Sí
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleRsvp(evento.id, evento.equipo.jugadores[0]?.id, "RECHAZADO")}
                    >
                      <X className="w-4 h-4 mr-1" /> No
                    </Button>
                  </div>
                </div>

                {evento.asistencias.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-white/50 mb-2">Confirmaciones</p>
                    <div className="flex flex-wrap gap-2">
                      {evento.asistencias.map((a: any) => (
                        <span key={a.id} className={`text-xs px-2 py-1 rounded border ${
                          a.estado === "CONFIRMADO" ? "border-green-500/30 text-green-400" :
                          a.estado === "RECHAZADO" ? "border-red-500/30 text-red-400" :
                          "border-white/10 text-white/50"
                        }`}>
                          {a.jugador.nombre} · {a.estado}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

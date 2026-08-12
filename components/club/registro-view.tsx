"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Check,
  X,
  Clock3,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Equipo {
  id: string;
  nombre: string;
  categoria: string;
  cupoMaximo: number | null;
  _count: { jugadores: number };
}

interface Solicitud {
  id: string;
  nombreJugador: string;
  fechaNacimiento: string | Date;
  posicion: string | null;
  nombreTutor: string;
  emailTutor: string;
  telefonoTutor: string | null;
  parentesco: string | null;
  estado: "PENDIENTE" | "LISTA_ESPERA" | "APROBADA" | "RECHAZADA";
  motivoRechazo: string | null;
  notasAdmin: string | null;
  waiverVersion: string | null;
  waiverAceptadoEn: string | Date | null;
  equipo: { id: string; nombre: string; categoria: string } | null;
  revisadoPor: { id: string; nombre: string } | null;
  createdAt: string | Date;
}

interface RegistroViewProps {
  club: { id: string; nombre: string; slug: string; equipos: Equipo[] };
  solicitudes: Solicitud[];
}

const estadoStyles: Record<Solicitud["estado"], string> = {
  PENDIENTE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LISTA_ESPERA: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  APROBADA: "bg-pitch-500/10 text-pitch-400 border-pitch-500/20",
  RECHAZADA: "bg-red-500/10 text-red-400 border-red-500/20",
};

const estadoLabels: Record<Solicitud["estado"], string> = {
  PENDIENTE: "Pendiente",
  LISTA_ESPERA: "Lista de espera",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

const filtros: Array<{ value: "TODAS" | Solicitud["estado"]; label: string }> = [
  { value: "TODAS", label: "Todas" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "LISTA_ESPERA", label: "Lista de espera" },
  { value: "APROBADA", label: "Aprobadas" },
  { value: "RECHAZADA", label: "Rechazadas" },
];

export function RegistroView({ club, solicitudes }: RegistroViewProps) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<"TODAS" | Solicitud["estado"]>("PENDIENTE");
  const [reviewing, setReviewing] = useState<Solicitud | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "waitlist" | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    equipoId: "",
    posicion: "",
    descuentoPorcentaje: "",
    motivoRechazo: "",
    notasAdmin: "",
  });

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return `/inscripcion/${club.slug}`;
    return `${window.location.origin}/inscripcion/${club.slug}`;
  }, [club.slug]);

  const filtradas = solicitudes.filter((s) => filtro === "TODAS" || s.estado === filtro);
  const pendientesCount = solicitudes.filter((s) => s.estado === "PENDIENTE").length;

  const openReview = (solicitud: Solicitud, act: "approve" | "reject" | "waitlist") => {
    setReviewing(solicitud);
    setAction(act);
    setReviewForm({
      equipoId: solicitud.equipo?.id || "",
      posicion: solicitud.posicion || "",
      descuentoPorcentaje: "",
      motivoRechazo: "",
      notasAdmin: "",
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewing || !action) return;
    setLoading(true);

    const res = await fetch(`/api/clubs/${club.id}/solicitudes/${reviewing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        equipoId: reviewForm.equipoId || undefined,
        posicion: reviewForm.posicion || undefined,
        descuentoPorcentaje: reviewForm.descuentoPorcentaje
          ? parseFloat(reviewForm.descuentoPorcentaje)
          : undefined,
        motivoRechazo: reviewForm.motivoRechazo || undefined,
        notasAdmin: reviewForm.notasAdmin || undefined,
      }),
    });

    if (res.ok) {
      setReviewing(null);
      setAction(null);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al procesar la solicitud");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Registro e inscripciones</h1>
          <p className="text-white/60">{club.nombre}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="border-white/10 hover:bg-white/10"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-pitch-400" /> : <LinkIcon className="w-4 h-4 mr-2" />}
          {copied ? "Link copiado" : "Copiar link de inscripción"}
        </Button>
      </div>

      <Card className="glass-card p-4 flex items-center gap-3 text-sm text-white/60">
        <Copy className="w-4 h-4 shrink-0" />
        <span className="truncate">{publicUrl}</span>
      </Card>

      <div className="flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              filtro === f.value
                ? "bg-pitch-500/10 text-pitch-400 border-pitch-500/20"
                : "border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            {f.label}
            {f.value === "PENDIENTE" && pendientesCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-dark-900 text-xs font-bold">
                {pendientesCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <Card className="glass-panel p-12 text-center">
          <ClipboardList className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No hay solicitudes en este filtro</h3>
          <p className="text-white/50 text-sm mt-2">
            Comparte el link de inscripción con las familias interesadas.
          </p>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filtradas.map((s) => (
            <motion.div key={s.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <Card className="glass-card p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{s.nombreJugador}</h3>
                    <p className="text-xs text-white/50">
                      Nace {formatDate(s.fechaNacimiento)} {s.posicion ? `· ${s.posicion}` : ""}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${estadoStyles[s.estado]}`}>
                    {estadoLabels[s.estado]}
                  </span>
                </div>

                <div className="text-sm text-white/70 space-y-1 mb-4">
                  <p>
                    <span className="text-white/40">Equipo:</span> {s.equipo ? `${s.equipo.nombre} (${s.equipo.categoria})` : "Sin asignar"}
                  </p>
                  <p>
                    <span className="text-white/40">Tutor:</span> {s.nombreTutor} {s.parentesco ? `· ${s.parentesco}` : ""}
                  </p>
                  <p>
                    <span className="text-white/40">Contacto:</span> {s.emailTutor}
                    {s.telefonoTutor ? ` · ${s.telefonoTutor}` : ""}
                  </p>
                  {s.motivoRechazo && (
                    <p className="text-red-400">Motivo de rechazo: {s.motivoRechazo}</p>
                  )}
                  {s.revisadoPor && <p className="text-white/40 text-xs">Revisado por {s.revisadoPor.nombre}</p>}
                  <p className="text-white/40 text-xs">
                    Consentimiento v{s.waiverVersion || "N/A"} · {s.waiverAceptadoEn ? formatDate(s.waiverAceptadoEn) : "Sin fecha"}
                  </p>
                </div>

                {(s.estado === "PENDIENTE" || s.estado === "LISTA_ESPERA") && (
                  <div className="mt-auto flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openReview(s, "approve")}
                      className="flex-1 bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
                    >
                      <Check className="w-4 h-4 mr-1" /> Aprobar
                    </Button>
                    {s.estado === "PENDIENTE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(s, "waitlist")}
                        className="flex-1 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                      >
                        <Clock3 className="w-4 h-4 mr-1" /> Lista de espera
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openReview(s, "reject")}
                      className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4 mr-1" /> Rechazar
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={!!reviewing} onOpenChange={(v) => { if (!v) { setReviewing(null); setAction(null); } }}>
        <DialogContent className="glass-panel border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              {action === "approve" ? "Aprobar solicitud" : action === "reject" ? "Rechazar solicitud" : "Enviar a lista de espera"}
            </DialogTitle>
          </DialogHeader>
          {reviewing && (
            <form onSubmit={handleReview} className="space-y-4 mt-4">
              <p className="text-sm text-white/60">
                {reviewing.nombreJugador} · Tutor: {reviewing.nombreTutor}
              </p>

              {action === "approve" && (
                <>
                  <div className="space-y-2">
                    <Label>Equipo</Label>
                    <Select value={reviewForm.equipoId} onValueChange={(v) => setReviewForm({ ...reviewForm, equipoId: v })} required>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecciona equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {club.equipos.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.nombre} · {eq.categoria}
                            {eq.cupoMaximo !== null ? ` (${eq._count.jugadores}/${eq.cupoMaximo})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!reviewing.posicion && (
                    <div className="space-y-2">
                      <Label>Posición</Label>
                      <Select value={reviewForm.posicion} onValueChange={(v) => setReviewForm({ ...reviewForm, posicion: v })} required>
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
                  )}
                  <div className="space-y-2">
                    <Label>Descuento % (opcional)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={reviewForm.descuentoPorcentaje}
                      onChange={(e) => setReviewForm({ ...reviewForm, descuentoPorcentaje: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </>
              )}

              {action === "reject" && (
                <div className="space-y-2">
                  <Label>Motivo de rechazo</Label>
                  <Textarea
                    value={reviewForm.motivoRechazo}
                    onChange={(e) => setReviewForm({ ...reviewForm, motivoRechazo: e.target.value })}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Notas internas (opcional)</Label>
                <Textarea
                  value={reviewForm.notasAdmin}
                  onChange={(e) => setReviewForm({ ...reviewForm, notasAdmin: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={
                  action === "reject"
                    ? "w-full bg-red-500 hover:bg-red-400 text-white font-semibold"
                    : "w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
                }
              >
                {loading ? "Guardando..." : "Confirmar"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

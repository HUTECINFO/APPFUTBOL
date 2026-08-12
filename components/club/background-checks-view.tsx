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
import { Plus, ShieldCheck, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BackgroundChecksViewProps {
  club: any;
  checks: any[];
  role: string;
}

const estadoColors: Record<string, string> = {
  PENDIENTE: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  APROBADO: "text-green-400 bg-green-400/10 border-green-400/20",
  RECHAZADO: "text-red-400 bg-red-400/10 border-red-400/20",
  EXPIRADO: "text-white/60 bg-white/5 border-white/10",
};

export function BackgroundChecksView({ club, checks, role }: BackgroundChecksViewProps) {
  const router = useRouter();
  const isAdmin = role === "SUPER_ADMIN" || role === "CLUB_ADMIN";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    usuarioId: "",
    estado: "PENDIENTE",
    proveedor: "",
    referencia: "",
    expiraEn: "",
    notas: "",
  });

  const admins = club.admins || [];
  const coaches = (club.equipos || [])
    .map((e: any) => e.entrenador)
    .filter(Boolean)
    .filter((v: any, i: number, a: any[]) => a.findIndex((x) => x.id === v.id) === i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/clubs/${club.id}/background-checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        expiraEn: form.expiraEn ? new Date(form.expiraEn).toISOString() : undefined,
      }),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ usuarioId: "", estado: "PENDIENTE", proveedor: "", referencia: "", expiraEn: "", notas: "" });
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al crear background check");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-pitch-400" />
            Background Checks
          </h1>
          <p className="text-white/60">Verificación de antecedentes para administradores y entrenadores.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Registrar verificación
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">Nueva verificación</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Select value={form.usuarioId} onValueChange={(v) => setForm({ ...form, usuarioId: v })} required>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona administrador o entrenador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__header_admins" disabled>Administradores</SelectItem>
                      {admins.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>{u.nombre} · {u.email}</SelectItem>
                      ))}
                      <SelectItem value="__header_coaches" disabled>Entrenadores</SelectItem>
                      {coaches.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>{u.nombre} · {u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={(v: any) => setForm({ ...form, estado: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                        <SelectItem value="APROBADO">Aprobado</SelectItem>
                        <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                        <SelectItem value="EXPIRADO">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expira el</Label>
                    <Input
                      type="date"
                      value={form.expiraEn}
                      onChange={(e) => setForm({ ...form, expiraEn: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Input
                    value={form.proveedor}
                    onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                    placeholder="Ej. HireRight, CertiCheck"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referencia / caso</Label>
                  <Input
                    value={form.referencia}
                    onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                    placeholder="ID del caso externo"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Input
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    placeholder="Observaciones"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
                  disabled={loading || !form.usuarioId}
                >
                  {loading ? "Guardando..." : "Guardar verificación"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {checks.length === 0 ? (
        <Card className="glass-panel p-12 text-center">
          <UserCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Sin verificaciones registradas</h3>
          <p className="text-white/50 text-sm mt-2">Registra el primer background check del club.</p>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {checks.map((check: any) => (
            <motion.div
              key={check.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            >
              <Card className="glass-panel p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{check.usuario?.nombre || "Usuario"}</p>
                    <p className="text-sm text-white/50">{check.usuario?.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${estadoColors[check.estado] || estadoColors.PENDIENTE}`}>
                    {check.estado}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-white/60">
                  <p>Proveedor: {check.proveedor || "—"}</p>
                  <p>Ref: {check.referencia || "—"}</p>
                  <p>Inicio: {formatDate(check.fechaInicio)}</p>
                  <p>Expira: {check.expiraEn ? formatDate(check.expiraEn) : "—"}</p>
                </div>
                {check.notas && <p className="text-sm text-white/40 bg-white/5 rounded-lg p-3">{check.notas}</p>}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

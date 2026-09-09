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
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CobrosViewProps {
  club: any;
  mensualidades: any[];
  role: string;
}

export function CobrosView({ club, mensualidades, role }: CobrosViewProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stripeLoadingId, setStripeLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    jugadorId: "",
    periodo: "",
    monto: club.feeMensual && Number(club.feeMensual) > 0 ? Number(club.feeMensual).toString() : "1200",
  });

  const canEdit = ["SUPER_ADMIN", "CLUB_ADMIN"].includes(role);

  const jugadores = club.equipos.flatMap((e: any) => e.jugadores || []);

  const totalPendiente = mensualidades
    .filter((m) => m.estado === "PENDIENTE" || m.estado === "VENCIDO")
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const totalPagado = mensualidades
    .filter((m) => m.estado === "PAGADO")
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/clubs/${club.id}/cobros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jugadorId: form.jugadorId,
        periodo: form.periodo,
        monto: parseFloat(form.monto),
      }),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ jugadorId: "", periodo: "", monto: club.feeMensual && Number(club.feeMensual) > 0 ? Number(club.feeMensual).toString() : "1200" });
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al crear mensualidad");
    }

    setLoading(false);
  };

  const handlePago = async (mensualidadId: string, metodo: string) => {
    const res = await fetch(`/api/clubs/${club.id}/cobros/${mensualidadId}/pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metodoPago: metodo }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al registrar pago");
    }
  };

  const handleStripeLink = async (mensualidadId: string) => {
    setStripeLoadingId(mensualidadId);
    setCopiedId(null);
    try {
      const res = await fetch(`/api/clubs/${club.id}/cobros/${mensualidadId}/stripe`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo generar el link de pago");

      try {
        await navigator.clipboard.writeText(data.url);
      } catch {
        const input = document.createElement("textarea");
        input.value = data.url;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setCopiedId(mensualidadId);
      window.setTimeout(() => setCopiedId((current) => current === mensualidadId ? null : current), 4000);
    } catch (error: any) {
      alert(error.message || "No se pudo generar el link de pago");
    } finally {
      setStripeLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Cobros</h1>
          <p className="text-white/60">{club.nombre}</p>
          <p className="mt-2 max-w-2xl text-sm text-white/50">
            Crea la mensualidad (por defecto $1,200 MXN), usa <span className="text-gold-400">Copiar link Stripe</span> y envíaselo al tutor por WhatsApp o correo. El tutor paga sin iniciar sesión; si activa su cuenta también verá el adeudo en <span className="text-white/70">Pagos</span>.
          </p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                <DollarSign className="w-4 h-4 mr-2" />
                Nueva mensualidad
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">Crear mensualidad</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Jugador</Label>
                  <Select value={form.jugadorId} onValueChange={(v) => setForm({ ...form, jugadorId: v })} required>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      {club.equipos.map((e: any) =>
                        e.jugadores?.map((j: any) => (
                          <SelectItem key={j.id} value={j.id}>
                            {j.nombre} · {e.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Periodo (YYYY-MM)</Label>
                  <Input
                    value={form.periodo}
                    onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                    placeholder="2026-07"
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monto (MXN)</Label>
                  <Input
                    type="number"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <Button type="submit" className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold" disabled={loading}>
                  {loading ? "Creando..." : "Crear mensualidad"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-sm text-white/60">Pagado</p>
          </div>
          <p className="text-2xl font-display font-bold text-white">{formatCurrency(totalPagado)}</p>
        </Card>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm text-white/60">Pendiente / Vencido</p>
          </div>
          <p className="text-2xl font-display font-bold text-white">{formatCurrency(totalPendiente)}</p>
        </Card>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-sm text-white/60">Total mensualidades</p>
          </div>
          <p className="text-2xl font-display font-bold text-white">{mensualidades.length}</p>
        </Card>
      </motion.div>

      <Card className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-6 py-3">Jugador</th>
                <th className="px-6 py-3">Equipo</th>
                <th className="px-6 py-3">Periodo</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mensualidades.map((m) => (
                <tr key={m.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 text-white font-medium">{m.jugador.nombre}</td>
                  <td className="px-6 py-4 text-white/60">{m.jugador.equipo.nombre}</td>
                  <td className="px-6 py-4 text-white/60">{m.periodo}</td>
                  <td className="px-6 py-4 text-white font-medium">{formatCurrency(parseFloat(m.monto))}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      m.estado === "PAGADO" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      m.estado === "VENCIDO" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                    }`}>
                      {m.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {m.estado !== "PAGADO" && canEdit && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-pitch-500/30 text-pitch-400 hover:bg-pitch-500/10"
                          onClick={() => handleStripeLink(m.id)}
                          disabled={stripeLoadingId === m.id}
                          title="Genera un link de Stripe para enviárselo al tutor"
                        >
                          {copiedId === m.id ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          {stripeLoadingId === m.id ? "Generando..." : copiedId === m.id ? "Link copiado" : "Copiar link Stripe"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          onClick={() => handlePago(m.id, "Transferencia")}
                        >
                          Transferencia
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-white/70 hover:bg-white/10"
                          onClick={() => handlePago(m.id, "Efectivo")}
                        >
                          Efectivo
                        </Button>
                      </div>
                    )}
                    {m.estado === "PAGADO" && (
                      <span className="text-xs text-white/40">{formatDate(m.fechaPago)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

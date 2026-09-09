"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Plus, Users, ArrowRight, Shield, UserPlus, KeyRound, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface EquiposViewProps {
  club: any;
  entrenadores: any[];
  role: string;
}

export function EquiposView({ club, entrenadores, role }: EquiposViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get("crear") === "1");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    genero: "",
    entrenadorId: "",
    cupoMaximo: "",
  });

  const [coachOpen, setCoachOpen] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachForm, setCoachForm] = useState({ nombre: "", email: "", telefono: "" });
  const [coachLink, setCoachLink] = useState("");
  const [coachCopied, setCoachCopied] = useState(false);

  const isAdmin = role === "SUPER_ADMIN" || role === "CLUB_ADMIN";

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoachLoading(true);
    try {
      const res = await fetch(`/api/clubs/${club.id}/entrenadores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coachForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear entrenador");
      if (data.activationUrl) {
        setCoachLink(data.activationUrl);
        await navigator.clipboard.writeText(data.activationUrl).catch(() => undefined);
      }
      setCoachForm({ nombre: "", email: "", telefono: "" });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al crear entrenador");
    } finally {
      setCoachLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/clubs/${club.id}/equipos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        entrenadorId: form.entrenadorId === "__none" ? undefined : form.entrenadorId || undefined,
        cupoMaximo: form.cupoMaximo ? parseInt(form.cupoMaximo, 10) : undefined,
      }),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ nombre: "", categoria: "", genero: "", entrenadorId: "", cupoMaximo: "" });
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al crear equipo");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Equipos</h1>
          <p className="text-white/60">{club.nombre}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={coachOpen} onOpenChange={(v) => { setCoachOpen(v); if (!v) setCoachLink(""); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/10 hover:bg-white/10">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Entrenador
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-xl font-display">Registrar entrenador</DialogTitle>
                </DialogHeader>
                {coachLink ? (
                  <div className="space-y-4 mt-4">
                    <div className="rounded-xl border border-pitch-500/20 bg-pitch-500/10 p-4">
                      <p className="flex items-center gap-2 font-medium text-pitch-300">
                        <CheckCircle2 className="h-4 w-4" /> Entrenador creado
                      </p>
                      <p className="mt-2 text-xs text-white/50">Comparte este enlace para que el entrenador active su cuenta:</p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="flex-1 truncate rounded-lg bg-dark-900/60 px-3 py-2 text-xs text-pitch-300">{coachLink}</code>
                        <Button type="button" size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(coachLink); setCoachCopied(true); setTimeout(() => setCoachCopied(false), 2000); }}>
                          {coachCopied ? <CheckCircle2 className="h-4 w-4 text-pitch-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="button" className="w-full" variant="outline" onClick={() => { setCoachOpen(false); setCoachLink(""); }}>
                      Cerrar
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleCoachSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Nombre completo</Label>
                      <Input
                        value={coachForm.nombre}
                        onChange={(e) => setCoachForm({ ...coachForm, nombre: e.target.value })}
                        placeholder="Nombre del entrenador"
                        required
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={coachForm.email}
                        onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                        placeholder="entrenador@correo.com"
                        required
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono (opcional)</Label>
                      <Input
                        value={coachForm.telefono}
                        onChange={(e) => setCoachForm({ ...coachForm, telefono: e.target.value })}
                        placeholder="Teléfono"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold" disabled={coachLoading}>
                      {coachLoading ? "Creando..." : "Crear entrenador"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button id="nuevo-equipo" className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo equipo
                </Button>
              </DialogTrigger>
            <DialogContent className="glass-panel border-white/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">Crear equipo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nombre del equipo</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Sub-13 Varonil"
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Input
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    placeholder="Ej. Sub-13"
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select
                    value={form.genero}
                    onValueChange={(v) => setForm({ ...form, genero: v })}
                    required
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Varonil">Varonil</SelectItem>
                      <SelectItem value="Femenil">Femenil</SelectItem>
                      <SelectItem value="Mixto">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cupo máximo (opcional)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.cupoMaximo}
                    onChange={(e) => setForm({ ...form, cupoMaximo: e.target.value })}
                    placeholder="Ej. 20"
                    className="bg-white/5 border-white/10"
                  />
                  <p className="text-xs text-white/40">Cuando se alcance, las nuevas inscripciones irán a lista de espera.</p>
                </div>
                <div className="space-y-2">
                  <Label>Entrenador</Label>
                  <Select
                    value={form.entrenadorId}
                    onValueChange={(v) => setForm({ ...form, entrenadorId: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona entrenador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Sin asignar</SelectItem>
                      {entrenadores.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nombre}
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
                  {loading ? "Creando..." : "Crear equipo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      {club.equipos.length === 0 ? (
        <Card className="glass-panel p-12 text-center">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No hay equipos registrados</h3>
          <p className="text-white/50 text-sm mt-2">
            {isAdmin ? "Crea el primer equipo para comenzar a gestionar tu club." : "Contacta al administrador del club."}
          </p>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {club.equipos.map((equipo: any) => (
            <motion.div
              key={equipo.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card className="glass-card p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pitch-500/10 flex items-center justify-center text-pitch-400 font-display font-bold text-lg">
                    {equipo.nombre.charAt(0)}
                  </div>
                  <div className="text-right text-xs text-white/40">
                    {equipo.genero}
                  </div>
                </div>

                <h3 className="text-xl font-display font-semibold mb-1">{equipo.nombre}</h3>
                <p className="text-sm text-white/50 mb-4">{equipo.categoria}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Entrenador</span>
                    <span className="text-white">{equipo.entrenador?.nombre || "Sin asignar"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Jugadores</span>
                    <span className="text-white font-medium">
                      {equipo._count.jugadores}
                      {equipo.cupoMaximo ? ` / ${equipo.cupoMaximo}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/club/${club.id}/equipos/${equipo.id}/roster`} className="flex-1">
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 text-sm">
                      Roster <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href={`/club/${club.id}/equipos/${equipo.id}/tactica`} className="flex-1">
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 text-sm">
                      Táctica <Shield className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {isAdmin && entrenadores.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Entrenadores del club</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entrenadores.map((e) => (
              <Card key={e.id} className="glass-card p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-500/10 text-pitch-400 font-display font-bold">
                  {e.nombre.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{e.nombre}</p>
                  <p className="truncate text-xs text-white/50">{e.email}</p>
                </div>
                <span className="rounded-full border border-pitch-500/20 bg-pitch-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-pitch-400">
                  Entrenador
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

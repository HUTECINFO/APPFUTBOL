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
import { MapPin, Plus, Trash2, ExternalLink, Pencil } from "lucide-react";

interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  lat?: number | null;
  lng?: number | null;
  googleMapsUrl?: string | null;
}

interface SedesViewProps {
  club: {
    id: string;
    nombre: string;
    sedes: Sede[];
  };
  role: string;
}

const emptyForm = { nombre: "", direccion: "", googleMapsUrl: "" };

export function SedesView({ club, role }: SedesViewProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const canEdit = ["SUPER_ADMIN", "CLUB_ADMIN"].includes(role);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (sede: Sede) => {
    setEditingId(sede.id);
    setForm({
      nombre: sede.nombre,
      direccion: sede.direccion,
      googleMapsUrl: sede.googleMapsUrl || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = editingId
      ? `/api/clubs/${club.id}/sedes/${editingId}`
      : `/api/clubs/${club.id}/sedes`;

    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al guardar sede");
    }

    setLoading(false);
  };

  const handleDelete = async (sedeId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sede?")) return;

    const res = await fetch(`/api/clubs/${club.id}/sedes/${sedeId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Error al eliminar sede");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Sedes</h1>
          <p className="text-white/60">{club.nombre}</p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm(emptyForm); } }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nueva sede
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">{editingId ? "Editar sede" : "Agregar sede"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Sede Principal"
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Ej: Ciudad de México"
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link de Google Maps (opcional)</Label>
                  <Input
                    value={form.googleMapsUrl}
                    onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    type="url"
                    className="bg-white/5 border-white/10"
                  />
                  <p className="text-xs text-white/40">Pega el link de "Compartir" de Google Maps para esta sede.</p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear sede"}
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
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {club.sedes.length === 0 ? (
          <Card className="glass-panel p-8 text-center col-span-full">
            <MapPin className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No hay sedes registradas.</p>
            {canEdit && <p className="text-sm text-white/40 mt-2">Crea una para empezar.</p>}
          </Card>
        ) : (
          club.sedes.map((sede) => (
            <motion.div key={sede.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card p-6 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pitch-500/10 text-pitch-400 flex items-center justify-center border border-pitch-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{sede.nombre}</h3>
                    <p className="text-sm text-white/60 mt-1">{sede.direccion}</p>
                  </div>
                </div>
                {sede.googleMapsUrl && (
                  <a
                    href={sede.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-pitch-400 hover:text-pitch-300"
                  >
                    Ver en Google Maps
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {canEdit && (
                  <div className="mt-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(sede)}
                      className="flex-1 border-white/10 hover:bg-white/10"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sede.id)}
                      className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

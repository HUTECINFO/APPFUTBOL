"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Palette, Building2, Coins, Eye, ClipboardList } from "lucide-react";
import { hexToHsl, hslString, brandCssVariables } from "@/lib/theme";
import { formatDateTime } from "@/lib/utils";

interface ConfiguracionViewProps {
  club: any;
  role: string;
}

export function ConfiguracionView({ club, role }: ConfiguracionViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: club.nombre || "",
    slug: club.slug || "",
    colorPrimario: club.colorPrimario || "#1FCB6B",
    colorSecundario: club.colorSecundario || "#F2B33D",
    logoUrl: club.logoUrl || "",
    feeMensual: club.feeMensual ? Number(club.feeMensual).toString() : "0",
    porcentajePlataforma: club.porcentajePlataforma ? Number(club.porcentajePlataforma).toString() : "5",
    activo: club.activo ?? true,
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const isAdmin = role === "SUPER_ADMIN" || role === "CLUB_ADMIN";

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/clubs/${club.id}/audit-logs`);
      if (res.ok) setLogs(await res.json());
    } finally {
      setLogsLoading(false);
    }
  };

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      nombre: form.nombre,
      slug: form.slug,
      colorPrimario: form.colorPrimario,
      colorSecundario: form.colorSecundario,
      logoUrl: form.logoUrl,
      feeMensual: parseFloat(form.feeMensual) || 0,
      porcentajePlataforma: parseFloat(form.porcentajePlataforma) || 0,
      activo: form.activo,
    };

    try {
      const res = await fetch(`/api/clubs/${club.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Configuración guardada correctamente." });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Error al guardar la configuración." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de red. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  const previewVars = brandCssVariables({
    colorPrimario: form.colorPrimario,
    colorSecundario: form.colorSecundario,
  });

  const primaryHsl = hexToHsl(form.colorPrimario);
  const secondaryHsl = hexToHsl(form.colorSecundario);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Configuración</h1>
          <p className="text-white/60">Personaliza tu club y la experiencia de tus usuarios.</p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isAdmin}
          className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-dark-800/60 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-pitch-500 data-[state=active]:text-dark-900">
            <Building2 className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="marca" className="rounded-lg data-[state=active]:bg-pitch-500 data-[state=active]:text-dark-900">
            <Palette className="w-4 h-4 mr-2" /> Marca
          </TabsTrigger>
          <TabsTrigger value="finanzas" className="rounded-lg data-[state=active]:bg-pitch-500 data-[state=active]:text-dark-900">
            <Coins className="w-4 h-4 mr-2" /> Finanzas
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-lg data-[state=active]:bg-pitch-500 data-[state=active]:text-dark-900">
            <Eye className="w-4 h-4 mr-2" /> Vista previa
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="rounded-lg data-[state=active]:bg-pitch-500 data-[state=active]:text-dark-900">
            <ClipboardList className="w-4 h-4 mr-2" /> Auditoría
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-panel p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nombre del club</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    className="bg-white/5 border-white/10"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="bg-white/5 border-white/10"
                    disabled={!isAdmin}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL del logo</Label>
                <Input
                  value={form.logoUrl}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10"
                  disabled={!isAdmin}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-medium text-white">Club activo</p>
                  <p className="text-sm text-white/50">Los usuarios podrán acceder a la plataforma.</p>
                </div>
                <Switch
                  checked={form.activo}
                  onCheckedChange={(v) => handleChange("activo", v)}
                  disabled={!isAdmin}
                />
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="marca">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-panel p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Color primario</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={form.colorPrimario}
                      onChange={(e) => handleChange("colorPrimario", e.target.value)}
                      className="w-16 h-10 p-1 bg-white/5 border-white/10"
                      disabled={!isAdmin}
                    />
                    <Input
                      value={form.colorPrimario}
                      onChange={(e) => handleChange("colorPrimario", e.target.value)}
                      className="flex-1 bg-white/5 border-white/10 font-mono"
                      disabled={!isAdmin}
                    />
                  </div>
                  {primaryHsl && (
                    <p className="text-xs text-white/40 font-mono">
                      hsl({hslString(primaryHsl)})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Color secundario</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={form.colorSecundario}
                      onChange={(e) => handleChange("colorSecundario", e.target.value)}
                      className="w-16 h-10 p-1 bg-white/5 border-white/10"
                      disabled={!isAdmin}
                    />
                    <Input
                      value={form.colorSecundario}
                      onChange={(e) => handleChange("colorSecundario", e.target.value)}
                      className="flex-1 bg-white/5 border-white/10 font-mono"
                      disabled={!isAdmin}
                    />
                  </div>
                  {secondaryHsl && (
                    <p className="text-xs text-white/40 font-mono">
                      hsl({hslString(secondaryHsl)})
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-white/50">
                Estos colores se aplican automáticamente a botones, acentos, gráficos y la interfaz del club.
              </p>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="finanzas">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-panel p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Mensualidad por jugador (MXN)</Label>
                  <Input
                    type="number"
                    value={form.feeMensual}
                    onChange={(e) => handleChange("feeMensual", e.target.value)}
                    className="bg-white/5 border-white/10"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Porcentaje de plataforma (%)</Label>
                  <Input
                    type="number"
                    value={form.porcentajePlataforma}
                    onChange={(e) => handleChange("porcentajePlataforma", e.target.value)}
                    className="bg-white/5 border-white/10"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="preview">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="glass-panel p-8" style={previewVars}>
              <div className="flex items-center gap-6 mb-8">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-20 h-20 rounded-2xl object-contain bg-white/5 border border-white/10" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-pitch-500/10 text-pitch-400 flex items-center justify-center text-3xl font-display font-bold border border-pitch-500/20">
                    {form.nombre.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">{form.nombre || "Nombre del club"}</h2>
                  <p className="text-pitch-400">clubone.io/{form.slug || "slug"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                  Botón primario
                </Button>
                <Button variant="outline" className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10">
                  Botón outline
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-4 rounded-xl bg-pitch-500/10 border border-pitch-500/20 text-pitch-400">
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-xs text-white/60">Jugadores</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-white/60">Equipos</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white">
                  <p className="text-2xl font-bold">$15k</p>
                  <p className="text-xs text-white/60">Ingresos</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-xs text-white/60">Asistencia</p>
                </div>
              </div>
            </Card>

            <p className="text-sm text-white/50 text-center">
              Así se verá la interfaz de tu club con los colores seleccionados.
            </p>
          </motion.div>
        </TabsContent>

        <TabsContent value="auditoria">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Bitácora de auditoría</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={loadLogs}
                disabled={logsLoading}
                className="border-white/10 hover:bg-white/10"
              >
                {logsLoading ? "Cargando..." : "Cargar registros"}
              </Button>
            </div>
            {logs.length === 0 ? (
              <Card className="glass-panel p-8 text-center text-white/50">
                Sin registros aún. Presiona "Cargar registros" para consultar la bitácora.
              </Card>
            ) : (
              <Card className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-white/60">
                      <tr>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Acción</th>
                        <th className="p-4">Entidad</th>
                        <th className="p-4">Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log: any) => (
                        <tr key={log.id} className="border-t border-white/5">
                          <td className="p-4 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                          <td className="p-4">{log.actorRol}</td>
                          <td className="p-4 capitalize">{log.accion}</td>
                          <td className="p-4">{log.entidad} · {log.entidadId.slice(0, 8)}…</td>
                          <td className="p-4 max-w-xs truncate">
                            {log.cambios ? JSON.stringify(log.cambios) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

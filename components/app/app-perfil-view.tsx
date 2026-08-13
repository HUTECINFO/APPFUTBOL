"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogOut, Mail, Phone, Shield, Users, Palette, Layout, RotateCcw } from "lucide-react";
import { saveAppTheme, AppThemeConfig } from "@/components/theme/app-theme-provider";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CLUB_ADMIN: "Administrador de club",
  ENTRENADOR: "Entrenador",
  JUGADOR: "Jugador",
  TUTOR: "Tutor",
};

interface AppPerfilViewProps {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    rol: string;
    image: string | null;
  };
  jugadores: any[];
}

const STORAGE_KEY = "appfutbol-app-theme";

function loadTheme(): AppThemeConfig {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function AppPerfilView({ usuario, jugadores }: AppPerfilViewProps) {
  const [theme, setTheme] = useState<AppThemeConfig>(loadTheme());

  useEffect(() => {
    setTheme(loadTheme());
  }, []);

  const updateTheme = (patch: Partial<AppThemeConfig>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveAppTheme(next);
  };

  const resetTheme = () => {
    setTheme({});
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    saveAppTheme({});
  };

  return (
    <div className="px-4 pt-6 safe-area-pt">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="matchday-glow relative mb-6 overflow-hidden rounded-[1.75rem] border border-pitch-400/25 bg-gradient-to-br from-pitch-900 via-dark-800 to-dark-900"
      >
        <div aria-hidden className="pitch-stripes absolute inset-0" />
        <div aria-hidden className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-pitch-400/20 blur-3xl" />
        <div
          aria-hidden
          className="animate-hero-sheen pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        <div className="relative flex flex-col items-center p-6 text-center">
          <p aria-hidden className="text-outline pointer-events-none absolute right-4 top-2 font-display text-6xl font-bold">
            {usuario.nombre.charAt(0).toUpperCase()}
          </p>
          <div className="pitch-glow mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-pitch-400/40 bg-black/40 font-display text-3xl font-bold text-pitch-300">
            {usuario.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={usuario.image} alt={usuario.nombre} className="h-full w-full rounded-3xl object-cover" />
            ) : (
              usuario.nombre.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            {usuario.nombre}
          </h1>
          <span className="mt-2 rounded-full border border-pitch-400/40 bg-pitch-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-pitch-300">
            {ROLE_LABELS[usuario.rol] || usuario.rol}
          </span>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-6 space-y-3"
      >
        <Card className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Mail className="h-4 w-4 text-white/50" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Email</p>
            <p className="truncate text-sm text-white">{usuario.email}</p>
          </div>
        </Card>
        {usuario.telefono && (
          <Card className="glass-card flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Phone className="h-4 w-4 text-white/50" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Teléfono</p>
              <p className="text-sm text-white">{usuario.telefono}</p>
            </div>
          </Card>
        )}
        <Card className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Shield className="h-4 w-4 text-white/50" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Rol</p>
            <p className="text-sm text-white">{ROLE_LABELS[usuario.rol] || usuario.rol}</p>
          </div>
        </Card>
      </motion.section>

      {jugadores.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mb-6"
        >
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide">
            <Users className="h-4 w-4 text-white/50" /> Mi plantilla
          </h2>
          <div className="space-y-3">
            {jugadores.map((j) => (
              <Card key={j.id} className="glass-card flex items-center gap-3 p-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-pitch-500/20 to-gold-500/20 font-display text-lg font-bold text-white">
                  {j.dorsal != null && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[9px] font-bold text-dark-900">
                      {j.dorsal}
                    </span>
                  )}
                  {j.nombre.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{j.nombre}</p>
                  <p className="truncate text-xs text-white/50">
                    {j.posicion} · {j.equipo.nombre} · {j.equipo.club.nombre}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card mb-6 p-4">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide">
            <Palette className="h-4 w-4 text-white/50" /> Personalización
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/50">Color principal</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={theme.colorPrimario || "#1FCB6B"}
                    onChange={(e) => updateTheme({ colorPrimario: e.target.value })}
                    className="h-9 w-12 border-white/10 bg-white/5 p-1"
                  />
                  <Input
                    value={theme.colorPrimario || "#1FCB6B"}
                    onChange={(e) => updateTheme({ colorPrimario: e.target.value })}
                    className="flex-1 border-white/10 bg-white/5 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/50">Color de acento</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={theme.colorSecundario || "#F2B33D"}
                    onChange={(e) => updateTheme({ colorSecundario: e.target.value })}
                    className="h-9 w-12 border-white/10 bg-white/5 p-1"
                  />
                  <Input
                    value={theme.colorSecundario || "#F2B33D"}
                    onChange={(e) => updateTheme({ colorSecundario: e.target.value })}
                    className="flex-1 border-white/10 bg-white/5 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-white/50" />
                <div>
                  <p className="text-sm font-medium">Modo compacto</p>
                  <p className="text-xs text-white/50">Reduce espacios y tamaños en la app.</p>
                </div>
              </div>
              <Switch
                checked={!!theme.compact}
                onCheckedChange={(v) => updateTheme({ compact: v })}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetTheme}
              className="w-full border-white/10 text-white/70 hover:bg-white/10"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Restablecer predeterminado
            </Button>
          </div>
        </Card>

        <Button
          variant="outline"
          className="h-12 w-full rounded-2xl border-red-500/30 font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
        </Button>
      </motion.section>
    </div>
  );
}

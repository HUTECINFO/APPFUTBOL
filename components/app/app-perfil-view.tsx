"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, LogOut, Mail, Phone, Shield, Users, Palette, Layout, RotateCcw } from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/inicio">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Perfil</h1>
      </div>

      <Card className="glass-card p-6 mb-6 flex flex-col items-center text-center">
        <Avatar className="w-20 h-20 border border-white/10 mb-4">
          <AvatarImage src={usuario.image || undefined} />
          <AvatarFallback className="bg-pitch-500/10 text-pitch-400 text-2xl">
            {usuario.nombre.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-display font-bold text-white">{usuario.nombre}</h2>
        <p className="text-sm text-pitch-400">{ROLE_LABELS[usuario.rol] || usuario.rol}</p>
      </Card>

      <div className="space-y-3 mb-6">
        <Card className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <Mail className="w-4 h-4 text-white/50" />
          </div>
          <div>
            <p className="text-xs text-white/40">Email</p>
            <p className="text-sm text-white">{usuario.email}</p>
          </div>
        </Card>
        {usuario.telefono && (
          <Card className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Phone className="w-4 h-4 text-white/50" />
            </div>
            <div>
              <p className="text-xs text-white/40">Teléfono</p>
              <p className="text-sm text-white">{usuario.telefono}</p>
            </div>
          </Card>
        )}
        <Card className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <Shield className="w-4 h-4 text-white/50" />
          </div>
          <div>
            <p className="text-xs text-white/40">Rol</p>
            <p className="text-sm text-white">{ROLE_LABELS[usuario.rol] || usuario.rol}</p>
          </div>
        </Card>
      </div>

      {jugadores.length > 0 && (
        <>
          <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-white/50" /> Mis jugadores
          </h2>
          <div className="space-y-3 mb-6">
            {jugadores.map((j) => (
              <Card key={j.id} className="glass-card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pitch-500/20 to-gold-500/20 flex items-center justify-center text-lg font-display font-bold text-white">
                  {j.nombre.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{j.nombre}</p>
                  <p className="text-xs text-white/50">
                    {j.equipo.nombre} · {j.equipo.club.nombre}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card className="glass-card p-4 mb-6">
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-white/50" /> Personalización
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
                  className="w-12 h-9 p-1 bg-white/5 border-white/10"
                />
                <Input
                  value={theme.colorPrimario || "#1FCB6B"}
                  onChange={(e) => updateTheme({ colorPrimario: e.target.value })}
                  className="flex-1 bg-white/5 border-white/10 text-xs font-mono"
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
                  className="w-12 h-9 p-1 bg-white/5 border-white/10"
                />
                <Input
                  value={theme.colorSecundario || "#F2B33D"}
                  onChange={(e) => updateTheme({ colorSecundario: e.target.value })}
                  className="flex-1 bg-white/5 border-white/10 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-white/50" />
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
            <RotateCcw className="w-4 h-4 mr-2" /> Restablecer predeterminado
          </Button>
        </div>
      </Card>

      <Button
        variant="outline"
        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
      </Button>
    </div>
  );
}

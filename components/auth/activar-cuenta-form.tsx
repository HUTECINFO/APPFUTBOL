"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ActivarCuentaForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/public/activar-cuenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo activar la cuenta");
      setReady(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo activar la cuenta");
    } finally {
      setLoading(false);
    }
  }

  if (ready) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-pitch-400" />
        <h1 className="font-display text-2xl font-bold">Tu acceso está listo</h1>
        <p className="mt-2 text-sm text-white/60">Ya puedes consultar el calendario, pagos y datos del jugador.</p>
        <Button asChild className="mt-6 w-full bg-pitch-500 font-semibold text-dark-900 hover:bg-pitch-400">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <KeyRound className="mx-auto mb-4 h-10 w-10 text-pitch-400" />
        <h1 className="font-display text-2xl font-bold">Activa tu cuenta</h1>
        <p className="mt-2 text-sm text-white/60">Crea una contraseña para acceder como tutor.</p>
      </div>

      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="border-white/10 bg-white/5"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmation">Confirmar contraseña</Label>
        <Input
          id="confirmation"
          type="password"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          className="border-white/10 bg-white/5"
        />
      </div>
      <Button type="submit" disabled={loading || !token} className="w-full bg-pitch-500 font-semibold text-dark-900 hover:bg-pitch-400">
        {loading ? "Activando..." : "Crear acceso"}
      </Button>
      {!token && <p className="text-center text-sm text-red-400">El enlace de activación está incompleto.</p>}
    </form>
  );
}

"use client";

import { useState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";

interface CrearClaveFormProps {
  solicitudId: string;
  sessionId?: string;
  email: string;
}

export function CrearClaveForm({ solicitudId, sessionId, email }: CrearClaveFormProps) {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/evento/crear-clave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId, sessionId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear el acceso");
      setListo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el acceso");
    } finally {
      setLoading(false);
    }
  };

  if (listo) {
    return (
      <div className="rounded-2xl border border-green-500/25 bg-green-500/10 p-5 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
        <p className="font-display text-lg font-bold uppercase tracking-wide text-white">Tu acceso está listo</p>
        <p className="mt-1 text-sm text-white/60">
          Inicia sesión con <span className="font-semibold text-white">{email}</span> y tu nueva contraseña.
        </p>
        <a
          href="/login"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-pitch-500 to-pitch-400 font-display text-sm font-bold uppercase tracking-[0.15em] text-dark-900 transition-transform active:scale-[0.98]"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Crea tu contraseña (mín. 8 caracteres)"
        autoComplete="new-password"
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-pitch-400/50 focus:outline-none"
      />
      <input
        type="password"
        value={confirmacion}
        onChange={(e) => setConfirmacion(e.target.value)}
        placeholder="Confirma tu contraseña"
        autoComplete="new-password"
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-pitch-400/50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pitch-500 to-pitch-400 font-display text-sm font-bold uppercase tracking-[0.15em] text-dark-900 transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <KeyRound className="h-4 w-4" />
        {loading ? "Creando acceso..." : "Crear mi acceso"}
      </button>
    </form>
  );
}

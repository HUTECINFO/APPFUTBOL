"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    clubNombre: "",
    nombre: "",
    email: "",
    telefono: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar");

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contenido-principal" className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="glass-panel w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Club One</h1>
          <p className="text-white/60">One club. One platform.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-pitch-500/10 text-pitch-400 border-pitch-500/20">
            ¡Registro exitoso! Redirigiendo al inicio de sesión...
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="clubNombre">Nombre del club / academia</Label>
            <Input id="clubNombre" name="clubNombre" value={form.clubNombre} onChange={handleChange} required className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Tu nombre completo</Label>
            <Input id="nombre" name="nombre" autoComplete="name" value={form.nombre} onChange={handleChange} required className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" autoComplete="tel" value={form.telefono} onChange={handleChange} className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={handleChange} required className="bg-white/5 border-white/10" />
          </div>
          <Button type="submit" className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-pitch-400 hover:underline">
            Inicia sesión
          </Link>
        </div>
      </Card>
    </div>
  );
}

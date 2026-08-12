"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      const session = await getSession();
      const role = session?.user?.role;
      const destination =
        role === "SUPER_ADMIN"
          ? "/super-admin/dashboard"
          : role === "JUGADOR" || role === "TUTOR"
            ? "/app/inicio"
            : "/club";
      router.push(destination);
      router.refresh();
    } else {
      setError("Correo o contraseña incorrectos");
    }

    setLoading(false);
  };

  return (
    <div id="contenido-principal" className="min-h-screen flex items-center justify-center px-6">
      <Card className="glass-panel w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Club One</h1>
          <p className="text-white/60">One club. One platform.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-white/5 border-white/10"
            />
          </div>
          <Button type="submit" className="w-full bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-pitch-400 hover:underline">
            Registra tu club
          </Link>
        </div>
      </Card>
    </div>
  );
}

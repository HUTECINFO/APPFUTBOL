"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAccountDialog({ rol }: { rol: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (rol === "SUPER_ADMIN") return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cuenta", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmacion: confirmacion.trim().toUpperCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar la cuenta.");
      await signOut({ callbackUrl: "/login?cuenta=eliminada" });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPassword("");
          setConfirmacion("");
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="mx-auto mt-4 flex items-center gap-2 text-xs font-semibold text-white/40 underline-offset-4 hover:text-red-400 hover:underline"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar mi cuenta
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-white/10 bg-dark-800">
        <form onSubmit={handleDelete} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar cuenta</DialogTitle>
            <DialogDescription className="text-left text-white/60">
              Se eliminará tu acceso a Club One, tus datos de perfil y tus mensajes de chat. Esta acción no se
              puede deshacer. Los registros deportivos y de pagos que administra tu club se conservan sin
              vincularse a tu cuenta.
              {rol === "CLUB_ADMIN" && " Si eres el único administrador de tu club, nadie podrá administrarlo hasta que soporte asigne a otra persona."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-password" className="text-white/70">Contraseña</Label>
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-white/10 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm" className="text-white/70">
              Escribe <span className="font-bold text-white">ELIMINAR</span> para confirmar
            </Label>
            <Input
              id="delete-confirm"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              autoCapitalize="characters"
              autoComplete="off"
              required
              className="border-white/10 bg-white/5"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="submit"
              disabled={loading || confirmacion.trim().toUpperCase() !== "ELIMINAR" || !password}
              className="w-full bg-red-600 font-bold text-white hover:bg-red-700"
            >
              {loading ? "Eliminando…" : "Eliminar definitivamente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

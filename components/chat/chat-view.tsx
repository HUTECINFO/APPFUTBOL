"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Send } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ChatViewProps {
  club: any;
  mensajesIniciales: any[];
  userId: string;
  userName: string;
  role: string;
}

export function ChatView({ club, mensajesIniciales, userId, userName, role }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [equipoId, setEquipoId] = useState(club.equipos[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      if (!equipoId) return;
      setSyncing(true);
      try {
        const res = await fetch(`/api/clubs/${club.id}/equipos/${equipoId}/mensajes`);
        if (res.ok && !cancelled) setMensajes(await res.json());
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };

    sync();
    const interval = window.setInterval(sync, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [club.id, equipoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !equipoId) return;

    setLoading(true);

    const res = await fetch(`/api/clubs/${club.id}/equipos/${equipoId}/mensajes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: texto }),
    });

    if (res.ok) {
      const msg = await res.json();
      setMensajes((prev) => [...prev, msg]);
      setTexto("");
    } else {
      const data = await res.json();
      alert(data.error || "Error al enviar mensaje");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Chat de equipo</h1>
          <p className="text-white/60">{club.nombre}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={equipoId}
            onChange={(e) => setEquipoId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
          >
            {club.equipos.map((e: any) => (
              <option key={e.id} value={e.id} className="bg-dark-800">
                {e.nombre}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 text-xs text-pitch-400">
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sincronizado
          </div>
        </div>
      </div>

      <Card className="glass-panel flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {mensajes.length === 0 ? (
            <div className="text-center text-white/40 py-12">
              <p>No hay mensajes en este chat.</p>
              <p className="text-sm">Sé el primero en escribir.</p>
            </div>
          ) : (
            mensajes.map((msg, i) => {
              const isMe = msg.autorId === userId;
              return (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isMe
                      ? "bg-pitch-500/20 text-white border border-pitch-500/30 rounded-br-none"
                      : "bg-white/5 text-white border border-white/10 rounded-bl-none"
                  }`}>
                    <p className="text-xs text-white/50 mb-1">
                      {msg.autor?.nombre || "Usuario"} · {msg.autor?.rol || role}
                    </p>
                    <p className="text-sm">{msg.contenido}</p>
                    <p className="text-[10px] text-white/30 mt-1 text-right">
                      {formatDateTime(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex gap-3">
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="bg-white/5 border-white/10 flex-1"
            disabled={loading || !equipoId}
          />
          <Button
            type="submit"
            className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
            disabled={loading || !texto.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, RefreshCw, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

interface Equipo {
  id: string;
  nombre: string;
  clubId: string;
}

interface AppChatViewProps {
  equipos: Equipo[];
  mensajesIniciales: any[];
  userId: string;
  role: string;
}

export function AppChatView({ equipos, mensajesIniciales, userId, role }: AppChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [equipoId, setEquipoId] = useState(equipos[0]?.id || "");
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const equipoActual = equipos.find((e) => e.id === equipoId);
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      if (!equipoId) return;
      const equipo = equipos.find((item) => item.id === equipoId);
      if (!equipo) return;
      setSyncing(true);
      try {
        const res = await fetch(`/api/clubs/${equipo.clubId}/equipos/${equipo.id}/mensajes`);
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
  }, [equipoId, equipos]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleChangeEquipo = (nuevoEquipoId: string) => {
    setEquipoId(nuevoEquipoId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !equipoActual) return;

    setLoading(true);

    const res = await fetch(`/api/clubs/${equipoActual.clubId}/equipos/${equipoActual.id}/mensajes`, {
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
    <div className="min-h-screen p-4 flex flex-col h-screen">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/app/inicio">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold flex-1">Chat</h1>
        <div className="flex items-center gap-1 text-xs text-pitch-400" title="Actualización automática">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
        </div>
      </div>

      {equipos.length === 0 ? (
        <Card className="glass-panel p-8 text-center">
          <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No perteneces a ningún equipo con chat.</p>
        </Card>
      ) : (
        <>
          {equipos.length > 1 && (
            <select
              value={equipoId}
              onChange={(e) => handleChangeEquipo(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mb-4"
            >
              {equipos.map((e) => (
                <option key={e.id} value={e.id} className="bg-dark-800">
                  {e.nombre}
                </option>
              ))}
            </select>
          )}

          <Card className="glass-panel flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
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
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                          isMe
                            ? "bg-pitch-500/20 text-white border border-pitch-500/30 rounded-br-none"
                            : "bg-white/5 text-white border border-white/10 rounded-bl-none"
                        }`}
                      >
                        <p className="text-xs text-white/50 mb-1">
                          {msg.autor?.nombre || "Usuario"} · {msg.autor?.rol || role}
                        </p>
                        <p className="text-sm">{msg.contenido}</p>
                        <p className="text-[10px] text-white/30 mt-1 text-right">{formatDateTime(msg.createdAt)}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 flex gap-2">
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="bg-white/5 border-white/10 flex-1"
                disabled={loading}
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
        </>
      )}
    </div>
  );
}

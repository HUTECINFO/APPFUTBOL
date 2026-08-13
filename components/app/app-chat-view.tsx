"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col px-4 pt-6 safe-area-pt">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-end justify-between"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-pitch-400">Vestuario</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight">Chat</h1>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest",
            syncing ? "text-pitch-400" : "text-white/30"
          )}
          title="Actualización automática"
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", syncing ? "animate-pulse bg-pitch-400" : "bg-white/30")} />
          En vivo
        </span>
      </motion.header>

      {equipos.length === 0 ? (
        <div className="glass-panel flex flex-1 flex-col items-center justify-center p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-white/60">No perteneces a ningún equipo con chat.</p>
        </div>
      ) : (
        <>
          {equipos.length > 1 && (
            <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
              {equipos.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEquipoId(e.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all active:scale-95",
                    equipoId === e.id
                      ? "border-pitch-400/50 bg-pitch-500/20 text-pitch-300"
                      : "border-white/10 bg-white/5 text-white/50"
                  )}
                >
                  <Users className="h-3 w-3" />
                  {e.nombre}
                </button>
              ))}
            </div>
          )}

          <div className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem]">
            <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {mensajes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-white/40">
                  <MessageSquare className="mb-3 h-8 w-8 text-white/15" />
                  <p className="text-sm">No hay mensajes en este chat.</p>
                  <p className="text-xs text-white/25">Sé el primero en escribir.</p>
                </div>
              ) : (
                mensajes.map((msg, i) => {
                  const isMe = msg.autorId === userId;
                  return (
                    <motion.div
                      key={msg.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}
                    >
                      {!isMe && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/60">
                          {(msg.autor?.nombre || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[78%] px-4 py-2.5",
                          isMe
                            ? "rounded-3xl rounded-br-md border border-pitch-500/30 bg-gradient-to-br from-pitch-500/30 to-pitch-600/20 text-white"
                            : "rounded-3xl rounded-bl-md border border-white/10 bg-white/5 text-white"
                        )}
                      >
                        {!isMe && (
                          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-pitch-300/80">
                            {msg.autor?.nombre || "Usuario"} · {msg.autor?.rol || role}
                          </p>
                        )}
                        <p className="text-sm leading-snug">{msg.contenido}</p>
                        <p className="mt-1 text-right text-[9px] uppercase tracking-wider text-white/30">
                          {new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date(msg.createdAt))}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 bg-black/20 p-3">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe al equipo..."
                className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-pitch-400/50 focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pitch-400 to-pitch-500 text-dark-900 transition-transform active:scale-90 disabled:opacity-50"
                disabled={loading || !texto.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

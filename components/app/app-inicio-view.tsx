"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, MessageSquare, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

interface AppInicioViewProps {
  user: any;
  jugadores: any[];
  eventos: any[];
}

export function AppInicioView({ user, jugadores, eventos }: AppInicioViewProps) {
  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <p className="text-sm text-white/50">Hola,</p>
        <h1 className="text-2xl font-display font-bold text-gradient">{user.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/app/calendario">
          <Card className="glass-card p-4 text-center">
            <Calendar className="w-6 h-6 text-pitch-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Calendario</p>
          </Card>
        </Link>
        <Link href="/app/pagos">
          <Card className="glass-card p-4 text-center">
            <CreditCard className="w-6 h-6 text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Pagos</p>
          </Card>
        </Link>
        <Link href="/app/chat">
          <Card className="glass-card p-4 text-center">
            <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Chat</p>
          </Card>
        </Link>
        <Link href="/app/perfil">
          <Card className="glass-card p-4 text-center">
            <User className="w-6 h-6 text-white/60 mx-auto mb-2" />
            <p className="text-sm font-medium">Perfil</p>
          </Card>
        </Link>
      </div>

      <h2 className="text-lg font-display font-semibold mb-3">Mis jugadores</h2>
      <div className="space-y-3 mb-6">
        {jugadores.map((j) => (
          <Card key={j.id} className="glass-card p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pitch-500/20 to-gold-500/20 flex items-center justify-center text-lg font-display font-bold text-white">
              {j.nombre.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-white">{j.nombre}</p>
              <p className="text-xs text-white/50">{j.equipo.nombre} · {j.equipo.club.nombre}</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-display font-semibold mb-3">Próximos eventos</h2>
      <div className="space-y-3">
        {eventos.length === 0 ? (
          <p className="text-sm text-white/40">No hay eventos próximos.</p>
        ) : (
          eventos.map((e) => (
            <Card key={e.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{e.titulo}</p>
                  <p className="text-xs text-white/50">{e.equipo.nombre}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
              <p className="text-xs text-pitch-400 mt-2">{formatDateTime(e.fecha)}</p>
              {e.sede && <p className="text-xs text-white/40">{e.sede.nombre}</p>}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

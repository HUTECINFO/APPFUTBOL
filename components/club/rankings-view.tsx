"use client";

import { Card } from "@/components/ui/card";
import { Trophy, Target, AlertCircle, Users } from "lucide-react";

interface Jugador {
  id: string;
  nombre: string;
  dorsal?: number | null;
  equipo: {
    nombre: string;
  };
  asistencias: { id: string }[];
  goles: { id: string }[];
  tarjetas: { id: string; color: string }[];
}

interface RankingsViewProps {
  club: {
    id: string;
    nombre: string;
    equipos: Array<{
      nombre: string;
      jugadores: Jugador[];
    }>;
  };
}

export function RankingsView({ club }: RankingsViewProps) {
  const allPlayers = club.equipos.flatMap((e) => e.jugadores);

  const topGoleadores = [...allPlayers]
    .sort((a, b) => b.goles.length - a.goles.length)
    .slice(0, 10);

  const topAsistencias = [...allPlayers]
    .sort((a, b) => b.asistencias.length - a.asistencias.length)
    .slice(0, 10);

  const topTarjetas = [...allPlayers]
    .map((j) => ({
      ...j,
      amarillas: j.tarjetas.filter((t) => t.color === "amarilla").length,
      rojas: j.tarjetas.filter((t) => t.color === "roja").length,
    }))
    .sort((a, b) => b.rojas * 2 + b.amarillas - (a.rojas * 2 + a.amarillas))
    .slice(0, 10);

  const topAsistencia = [...allPlayers]
    .sort((a, b) => b.asistencias.length - a.asistencias.length)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Rankings</h1>
        <p className="text-white/60">{club.nombre}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goleadores */}
        <Card className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold">Top Goleadores</h2>
          </div>
          <div className="space-y-3">
            {topGoleadores.length === 0 ? (
              <p className="text-sm text-white/40">Sin datos aún</p>
            ) : (
              topGoleadores.map((j, i) => (
                <div key={j.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{j.nombre}</p>
                      <p className="text-xs text-white/40">{j.equipo.nombre}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gold-400">{j.goles.length}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Asistencias */}
        <Card className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold">Top Asistencias</h2>
          </div>
          <div className="space-y-3">
            {topAsistencias.length === 0 ? (
              <p className="text-sm text-white/40">Sin datos aún</p>
            ) : (
              topAsistencias.map((j, i) => (
                <div key={j.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{j.nombre}</p>
                      <p className="text-xs text-white/40">{j.equipo.nombre}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-400">{j.asistencias.length}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Disciplina */}
        <Card className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold">Tarjetas</h2>
          </div>
          <div className="space-y-3">
            {topTarjetas.length === 0 ? (
              <p className="text-sm text-white/40">Sin datos aún</p>
            ) : (
              topTarjetas.map((j, i) => (
                <div key={j.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{j.nombre}</p>
                      <p className="text-xs text-white/40">{j.equipo.nombre}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {j.rojas > 0 && <span className="w-4 h-4 rounded bg-red-600"></span>}
                    {j.amarillas > 0 && <span className="text-xs text-gold-400">{j.amarillas}Y</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Asistencia */}
        <Card className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pitch-500/10 text-pitch-400 flex items-center justify-center border border-pitch-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold">Mejor Asistencia</h2>
          </div>
          <div className="space-y-3">
            {topAsistencia.length === 0 ? (
              <p className="text-sm text-white/40">Sin datos aún</p>
            ) : (
              topAsistencia.map((j, i) => (
                <div key={j.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-pitch-500/10 text-pitch-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{j.nombre}</p>
                      <p className="text-xs text-white/40">{j.equipo.nombre}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-pitch-400">{j.asistencias.length}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

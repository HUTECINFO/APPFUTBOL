"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Check, X, MapPin } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

interface AppCalendarioViewProps {
  eventos: any[];
}

export function AppCalendarioView({ eventos }: AppCalendarioViewProps) {
  const router = useRouter();

  const handleRsvp = async (eventoId: string, jugadorId: string, estado: string) => {
    const clubId = eventos.find((e) => e.id === eventoId)?.equipo.clubId;
    const res = await fetch(`/api/clubs/${clubId}/eventos/${eventoId}/asistencia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jugadorId, estado }),
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/inicio">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Calendario</h1>
      </div>

      <div className="space-y-4">
        {eventos.length === 0 ? (
          <Card className="glass-panel p-8 text-center">
            <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No hay eventos programados.</p>
          </Card>
        ) : (
          eventos.map((e) => (
            <Card key={e.id} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-pitch-500/10 text-pitch-400 flex items-center justify-center border border-pitch-500/20">
                  <span className="text-xs font-bold">{new Date(e.fecha).getDate()}</span>
                </div>
                <div>
                  <p className="font-medium text-white">{e.titulo}</p>
                  <p className="text-xs text-white/50">{e.equipo.nombre}</p>
                </div>
              </div>
              <p className="text-xs text-pitch-400 mb-1">{formatDateTime(e.fecha)}</p>
              {e.sede && (
                e.sede.googleMapsUrl ? (
                  <a
                    href={e.sede.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-pitch-400 mb-3 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" /> {e.sede.nombre}
                  </a>
                ) : (
                  <p className="text-xs text-white/40 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.sede.nombre}</p>
                )
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                  onClick={() => handleRsvp(e.id, e.asistencias[0]?.jugadorId, "CONFIRMADO")}
                >
                  <Check className="w-4 h-4 mr-1" /> Sí
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleRsvp(e.id, e.asistencias[0]?.jugadorId, "RECHAZADO")}
                >
                  <X className="w-4 h-4 mr-1" /> No
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

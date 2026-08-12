"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import {
  Users,
  Shield,
  MapPin,
  CreditCard,
  Calendar,
  Trophy,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface DashboardViewProps {
  club: any;
  jugadoresCount: number;
  mensualidadesPendientes: number;
  proximosEventos: any[];
  role: string;
}

export function DashboardView({
  club,
  jugadoresCount,
  mensualidadesPendientes,
  proximosEventos,
  role,
}: DashboardViewProps) {
  const isAdmin = role === "SUPER_ADMIN" || role === "CLUB_ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-white/60">{club.nombre}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/club/${club.id}/equipos`}>
            <Button variant="outline" className="border-white/10 hover:bg-white/10">
              Ver equipos
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/club/${club.id}/equipos?crear=1`}>
              <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
                Nuevo equipo
              </Button>
            </Link>
          )}
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      >
        <KpiCard
          icon={<Shield className="w-5 h-5" />}
          label="Equipos"
          value={club._count.equipos}
          color="pitch"
        />
        <KpiCard
          icon={<Users className="w-5 h-5" />}
          label="Jugadores"
          value={jugadoresCount}
          color="blue"
        />
        <KpiCard
          icon={<MapPin className="w-5 h-5" />}
          label="Sedes"
          value={club._count.sedes}
          color="gold"
        />
        {isAdmin ? (
          <KpiCard
            icon={<CreditCard className="w-5 h-5" />}
            label="Mensualidades pendientes"
            value={mensualidadesPendientes}
            color="red"
          />
        ) : (
          <KpiCard
            icon={<Calendar className="w-5 h-5" />}
            label="Próximos eventos"
            value={proximosEventos.length}
            color="pitch"
          />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pitch-400" />
              Próximos eventos
            </h2>
            <Link href={`/club/${club.id}/calendario`}>
              <Button variant="ghost" size="sm" className="text-pitch-400 hover:text-pitch-300">
                Ver todo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {proximosEventos.length === 0 ? (
            <p className="text-white/50 text-sm">No hay eventos próximos.</p>
          ) : (
            <div className="space-y-3">
              {proximosEventos.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div>
                    <p className="font-medium text-white">{evento.titulo}</p>
                    <p className="text-sm text-white/50">{evento.equipo.nombre}</p>
                  </div>
                  <div className="text-right text-sm text-white/60">
                    {formatDateTime(evento.fecha)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-400" />
              Equipos activos
            </h2>
            <Link href={`/club/${club.id}/equipos`}>
              <Button variant="ghost" size="sm" className="text-pitch-400 hover:text-pitch-300">
                Ver todo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {club.equipos.map((equipo: any) => (
              <Link key={equipo.id} href={`/club/${club.id}/equipos/${equipo.id}/roster`}>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-pitch-400/30 transition-colors">
                  <div>
                    <p className="font-medium text-white">{equipo.nombre}</p>
                    <p className="text-sm text-white/50">
                      {equipo.categoria} · {equipo.genero}
                    </p>
                  </div>
                  <div className="text-right text-sm text-white/60">
                    {equipo._count.jugadores} jugadores
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "pitch" | "blue" | "gold" | "red";
}) {
  const colorClasses = {
    pitch: "bg-pitch-500/10 text-pitch-400 border-pitch-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    gold: "bg-gold-500/10 text-gold-400 border-gold-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <motion.div variants={item}>
      <Card className="glass-card p-4 sm:p-6 h-full">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-4 border ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-2xl sm:text-3xl font-display font-bold text-white">{value}</p>
        <p className="text-sm text-white/50 mt-1">{label}</p>
      </Card>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatUsd } from "@/lib/evento-tour";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDollarSign, Goal, Hourglass, MapPin, PackageCheck, Search, Users } from "lucide-react";

interface Kpis {
  ingresosUsd: number;
  pagados: number;
  pendientesPago: number;
  cupoTotal: number;
  inscritos: number;
  precioUsd: number;
}

interface SedeMetrica {
  id: string;
  nombre: string;
  categoria: string;
  cupo: number;
  inscritos: number;
  pagados: number;
  pendientes: number;
  ingresosUsd: number;
}

interface EventoDashboardViewProps {
  esEvento: boolean;
  clubNombre: string;
  kpis: Kpis;
  sedes: SedeMetrica[];
  solicitudes: any[];
}

const ESTADO_STYLE: Record<string, string> = {
  APROBADA: "border-green-500/25 bg-green-500/10 text-green-400",
  PENDIENTE: "border-gold-500/25 bg-gold-500/10 text-gold-400",
  LISTA_ESPERA: "border-blue-500/25 bg-blue-500/10 text-blue-400",
  RECHAZADA: "border-red-500/25 bg-red-500/10 text-red-400",
};

const ESTADO_LABEL: Record<string, string> = {
  APROBADA: "Pagado",
  PENDIENTE: "Pendiente de pago",
  LISTA_ESPERA: "Lista de espera",
  RECHAZADA: "Rechazada",
};

export function EventoDashboardView({ esEvento, clubNombre, kpis, sedes, solicitudes }: EventoDashboardViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [working, setWorking] = useState("");
  const [groupDraft, setGroupDraft] = useState<Record<string, string>>({});
  if (!esEvento) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card className="glass-panel p-10 text-center">
          <Goal className="mx-auto mb-4 h-10 w-10 text-white/20" />
          <h1 className="font-display text-2xl font-bold">Este club no es un evento</h1>
          <p className="mt-2 text-white/60">
            El panel de métricas de evento aplica únicamente para {clubNombre.includes("Tour") ? "el tour" : "clubes configurados como evento"}.
            Las métricas de suscripción y operación normal están en Dashboard y Cobros.
          </p>
        </Card>
      </div>
    );
  }

  const ocupacion = kpis.cupoTotal > 0 ? Math.round((kpis.pagados / kpis.cupoTotal) * 100) : 0;
  const query = search.trim().toLocaleLowerCase();

  const updateRegistration = async (id: string, body: Record<string, unknown>) => {
    setWorking(id);
    const res = await fetch(`/api/clubs/${location.pathname.split("/")[2]}/solicitudes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setWorking("");
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "No se pudo actualizar el registro");
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pitch-400">Panel del evento</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          USA Goalkeeper Tour <span className="text-gradient">2026</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/50">
          Métricas exclusivas del evento, separadas de la operación por suscripción de la plataforma.
          Todos los montos están en dólares americanos (USD).
        </p>
      </motion.header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={CircleDollarSign}
          label="Ingresos confirmados"
          value={formatUsd(kpis.ingresosUsd)}
          hint="USD · pagos aprobados"
          accent="text-gold-400"
          delay={0}
        />
        <KpiCard
          icon={Goal}
          label="Porteros pagados"
          value={String(kpis.pagados)}
          hint={`${ocupacion}% del cupo total`}
          accent="text-pitch-400"
          delay={0.05}
        />
        <KpiCard
          icon={Hourglass}
          label="Pendientes / espera"
          value={String(kpis.pendientesPago)}
          hint="sin pago confirmado"
          accent="text-blue-400"
          delay={0.1}
        />
        <KpiCard
          icon={Users}
          label="Cupo restante"
          value={String(Math.max(0, kpis.cupoTotal - kpis.pagados))}
          hint={`de ${kpis.cupoTotal} lugares`}
          accent="text-white/70"
          delay={0.15}
        />
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide">Sedes</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sedes.map((sede, i) => {
          const pct = sede.cupo > 0 ? Math.min(100, Math.round((sede.pagados / sede.cupo) * 100)) : 0;
          return (
            <motion.div
              key={sede.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="glass-card relative overflow-hidden p-5">
                <div aria-hidden className="pitch-stripes absolute inset-0 opacity-50" />
                <div className="relative">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pitch-300">
                    <MapPin className="h-3 w-3" /> {sede.categoria}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold uppercase text-white">{sede.nombre}</h3>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest">
                      <span className="text-white/50">{sede.pagados}/{sede.cupo} pagados</span>
                      <span className="text-pitch-300">{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-pitch-500 to-pitch-400"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-white/10 pt-3 text-xs">
                    <span className="text-white/50">{sede.pendientes} pendiente{sede.pendientes === 1 ? "" : "s"}</span>
                    <span className="font-display font-bold tabular-nums text-gold-400">{formatUsd(sede.ingresosUsd)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h2 className="font-display text-lg font-semibold uppercase tracking-wide">Operación por ciudad</h2><p className="text-xs text-white/40">Busca por jugador, tutor, confirmación o escanea el QR.</p></div>
        <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar o escanear QR" className="pl-9" /></div>
      </div>

      <div className="space-y-6">
        {sedes.map((sede) => {
          const rows = solicitudes.filter((item) => {
            if (item.equipo?.id !== sede.id) return false;
            if (!query) return true;
            const haystack = [item.id, item.numeroConfirmacion, item.nombreJugador, item.nombreTutor, item.emailTutor, item.grupoAsignado].filter(Boolean).join(" ").toLocaleLowerCase();
            return haystack.includes(query) || query.includes(String(item.id).toLocaleLowerCase());
          });
          return (
            <Card key={sede.id} className="glass-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h3 className="font-display text-xl font-bold uppercase">{sede.nombre}</h3><p className="text-xs text-white/40">{sede.pagados} pagados · {sede.pendientes} pendientes · {formatUsd(sede.ingresosUsd)}</p></div><MapPin className="h-5 w-5 text-pitch-400" /></div>
              {rows.length === 0 ? <p className="p-6 text-sm text-white/40">No hay registros que coincidan.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] text-sm">
                    <thead><tr className="border-b border-white/10 text-left text-[9px] font-bold uppercase tracking-widest text-white/35"><th className="px-4 py-3">Jugador</th><th className="px-4 py-3">Nivel / tallas</th><th className="px-4 py-3">Pago y firma</th><th className="px-4 py-3">Tutor</th><th className="px-4 py-3">Salud</th><th className="px-4 py-3">Grupo</th><th className="px-4 py-3">Check-in</th></tr></thead>
                    <tbody>{rows.map((item) => {
                      const birth = new Date(item.fechaNacimiento);
                      const age = new Date().getFullYear() - birth.getFullYear() - (new Date() < new Date(new Date().getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
                      const signed = Boolean(item.firmaTutor && item.waiverResponsabilidad && item.autorizacionMedica && item.autorizacionImagen && item.politicaCancelacion && item.codigoConducta);
                      return <tr key={item.id} className="border-b border-white/5 align-top last:border-0">
                        <td className="px-4 py-4"><p className="font-semibold text-white">{item.nombreJugador}</p><p className="text-xs text-white/40">{age} años · {item.categoriaNacimiento || "—"}</p><p className="mt-1 text-[10px] text-white/30">{item.numeroConfirmacion || item.id.slice(0, 8).toUpperCase()}</p></td>
                        <td className="px-4 py-4 text-xs text-white/60"><p>{item.nivel || "—"} · {item.anosPortero ?? "—"} años GK</p><p>Jersey {item.tallaJersey || "—"} · Guantes {item.tallaGuantes || "—"}</p><p>{item.clubActual || "Sin academia"}</p></td>
                        <td className="px-4 py-4"><span className={cn("rounded-full border px-2 py-1 text-[9px] font-bold uppercase", ESTADO_STYLE[item.estado] || ESTADO_STYLE.PENDIENTE)}>{ESTADO_LABEL[item.estado] || item.estado}</span><p className="mt-2 text-xs text-white/60">{item.montoPagado ? formatUsd(item.montoPagado) : "—"}</p><p className={cn("text-[10px]", signed ? "text-green-400" : "text-red-400")}>{signed ? "Firma completa" : "Firma incompleta"}</p></td>
                        <td className="px-4 py-4 text-xs text-white/60"><p>{item.nombreTutor}</p><p>{item.telefonoTutor || "—"}</p><p className="max-w-[190px] truncate">{item.emailTutor}</p></td>
                        <td className="max-w-[200px] px-4 py-4 text-xs text-white/60"><p>{item.lesionesCondiciones || "Sin observaciones"}</p><p className="mt-1 text-white/35">Seguro: {item.seguroMedicoProveedor || "—"}</p></td>
                        <td className="px-4 py-4"><div className="flex gap-2"><Input value={groupDraft[item.id] ?? item.grupoAsignado ?? ""} onChange={(event) => setGroupDraft({ ...groupDraft, [item.id]: event.target.value })} placeholder="Ej. U12-A" className="h-9 w-28" /><Button size="sm" variant="outline" disabled={working === item.id || item.estado !== "APROBADA"} onClick={() => updateRegistration(item.id, { action: "assign_group", grupoAsignado: groupDraft[item.id] ?? item.grupoAsignado ?? "" })}>Guardar</Button></div></td>
                        <td className="px-4 py-4">{item.checkedInAt ? <div><p className="flex items-center gap-1 text-xs font-semibold text-green-400"><CheckCircle2 className="h-4 w-4" /> Presente</p><p className="mt-1 flex items-center gap-1 text-[10px] text-white/40"><PackageCheck className="h-3 w-3" /> {item.kitEntregado ? "Kit entregado" : "Kit pendiente"}</p><Button size="sm" variant="ghost" className="mt-1 h-7 text-[10px] text-white/40" disabled={working === item.id} onClick={() => updateRegistration(item.id, { action: "undo_checkin" })}>Deshacer</Button></div> : <Button size="sm" disabled={working === item.id || item.estado !== "APROBADA" || !signed} onClick={() => updateRegistration(item.id, { action: "checkin", kitEntregado: true })}>Check-in + kit</Button>}</td>
                      </tr>;
                    })}</tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="glass-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Icon className={cn("h-4 w-4", accent)} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</p>
        </div>
        <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">{value}</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-white/35">{hint}</p>
      </Card>
    </motion.div>
  );
}

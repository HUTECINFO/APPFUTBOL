"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ClipboardCheck, Download, Search, Users, Gauge, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ATRIBUTOS,
  CATEGORIAS_COMPETITIVAS,
  PIES,
  avanceCaptura,
  nivelAtributo,
  promedioAtributos,
} from "@/lib/rubrica";
import type { RubricaAlumno, RubricaEquipo } from "@/lib/rubrica-server";

type Alumno = RubricaAlumno & { equipoId: string; equipoNombre: string };
type Form = Record<string, string>;

const CAMPOS_TEXTO = [
  "matricula", "categoriaCompetitiva", "estatura", "peso", "pieDominante", "rolPrincipal", "rolSecundario",
  "perfilTecnicoTactico", "fortalezas", "areasOportunidad", "objetivoIndividual", "observacionesEntrenador",
  "partidosJugados", "partidosTitular", "partidosSuplente", "minutos", "participaciones", "actitudDeportiva",
  "goles", "asistenciasGol", "torneos", "tarjetasAmarillas", "tarjetasRojas", "observacionesCompeticion",
] as const;
const CAMPOS_DECIMALES = new Set(["estatura", "peso", ...ATRIBUTOS.map((a) => a.key)]);
const CAMPOS_ENTEROS = new Set([
  "partidosJugados", "partidosTitular", "partidosSuplente", "minutos", "participaciones",
  "goles", "asistenciasGol", "torneos", "tarjetasAmarillas", "tarjetasRojas",
]);

function formDesdePerfil(perfil: Record<string, any> | null): Form {
  const form: Form = {};
  for (const campo of [...CAMPOS_TEXTO, ...ATRIBUTOS.map((a) => a.key)]) {
    const valor = perfil?.[campo];
    form[campo] = valor == null ? "" : String(valor);
  }
  const ligas: string[] = Array.isArray(perfil?.ligas) ? perfil!.ligas : [];
  [0, 1, 2].forEach((i) => { form[`liga${i}`] = ligas[i] ?? ""; });
  return form;
}

function cuerpoDesdeForm(form: Form) {
  const body: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(form)) {
    if (campo.startsWith("liga")) continue;
    const limpio = valor.trim();
    if (CAMPOS_DECIMALES.has(campo)) body[campo] = limpio === "" ? null : Number(limpio.replace(",", "."));
    else if (CAMPOS_ENTEROS.has(campo)) body[campo] = limpio === "" ? null : Math.round(Number(limpio));
    else if (campo === "pieDominante") body[campo] = limpio || null;
    else body[campo] = limpio || null;
  }
  body.ligas = [form.liga0, form.liga1, form.liga2].map((l) => (l ?? "").trim()).filter(Boolean);
  return body;
}

function edad(fecha: string | Date) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  const hoy = new Date();
  let anios = hoy.getFullYear() - d.getFullYear();
  if (hoy.getMonth() < d.getMonth() || (hoy.getMonth() === d.getMonth() && hoy.getDate() < d.getDate())) anios--;
  return anios;
}

function RadarAtributos({ valores, compacto = false }: { valores: Record<string, string | number | null | undefined>; compacto?: boolean }) {
  const data = ATRIBUTOS.map((a) => ({ atributo: a.corto, valor: Number(valores[a.key]) || 0 }));
  return (
    <ResponsiveContainer width="100%" height={compacto ? 180 : 260}>
      <RadarChart data={data} outerRadius={compacto ? "60%" : "62%"}>
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis dataKey="atributo" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: compacto ? 9 : 11 }} />
        <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
        <Radar dataKey="valor" stroke="hsl(var(--pitch-400))" fill="hsl(var(--pitch-400))" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function Campo({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/80">{label}</Label>
      {children}
      {hint && <p className="text-[11px] leading-snug text-white/40">{hint}</p>}
    </div>
  );
}

export function RubricaView({ club, equipos }: { club: { id: string; nombre: string }; equipos: RubricaEquipo[] }) {
  const router = useRouter();
  const [equipoFiltro, setEquipoFiltro] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<Alumno | null>(null);
  const [form, setForm] = useState<Form>({});
  const [tab, setTab] = useState("ficha");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const alumnos: Alumno[] = useMemo(
    () => equipos.flatMap((e) => e.jugadores.map((j) => ({ ...j, equipoId: e.id, equipoNombre: e.nombre }))),
    [equipos]
  );
  const visibles = alumnos.filter(
    (a) =>
      (equipoFiltro === "todos" || a.equipoId === equipoFiltro) &&
      (!busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || String(a.perfil?.matricula ?? "").includes(busqueda))
  );

  const completos = alumnos.filter((a) => avanceCaptura(a.perfil) === 100).length;
  const promedios = alumnos.map((a) => promedioAtributos(a.perfil)).filter((v): v is number => v != null);
  const promedioGeneral = promedios.length ? Math.round((promedios.reduce((s, v) => s + v, 0) / promedios.length) * 10) / 10 : null;

  const exportUrl = (params: Record<string, string>) =>
    `/api/clubs/${club.id}/rubrica/export?${new URLSearchParams(params).toString()}`;

  const abrir = (alumno: Alumno) => {
    setAbierto(alumno);
    setForm(formDesdePerfil(alumno.perfil));
    setTab("ficha");
    setError("");
  };
  const set = (campo: string, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  const usarEstadisticas = () => {
    if (!abierto) return;
    const e = abierto.estadisticas;
    setForm((f) => ({
      ...f,
      partidosJugados: String(e.partidosJugados),
      torneos: String(e.torneos),
      goles: String(e.goles),
      tarjetasAmarillas: String(e.tarjetasAmarillas),
      tarjetasRojas: String(e.tarjetasRojas),
    }));
  };

  const guardar = async () => {
    if (!abierto) return;
    setGuardando(true);
    setError("");
    const res = await fetch(`/api/clubs/${club.id}/jugadores/${abierto.id}/perfil-deportivo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpoDesdeForm(form)),
    });
    setGuardando(false);
    if (res.ok) {
      setAbierto(null);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo guardar el perfil");
    }
  };

  const promedioForm = promedioAtributos(Object.fromEntries(ATRIBUTOS.map((a) => [a.key, form[a.key] === "" ? null : form[a.key]])) as any);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pitch-300">Colegio</p>
          <h1 className="text-3xl font-display font-bold">Rúbrica deportiva</h1>
          <p className="text-white/60">{club.nombre} · perfil técnico-táctico y atributos de cada alumno</p>
        </div>
        <Button asChild className="bg-pitch-500 font-semibold text-dark-900 hover:bg-pitch-400">
          <a href={exportUrl(equipoFiltro === "todos" ? {} : { equipoId: equipoFiltro })}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: "Alumnos", valor: alumnos.length },
          { icon: CheckCircle2, label: "Perfiles completos", valor: `${completos}/${alumnos.length}` },
          { icon: Gauge, label: "Promedio general", valor: promedioGeneral ?? "—" },
        ].map(({ icon: Icon, label, valor }) => (
          <Card key={label} className="glass-panel p-4">
            <Icon className="mb-2 h-4 w-4 text-pitch-300" />
            <p className="text-2xl font-display font-bold">{valor}</p>
            <p className="text-[11px] uppercase tracking-wider text-white/40">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ id: "todos", nombre: "Todos" }, ...equipos].map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEquipoFiltro(e.id)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors",
                equipoFiltro === e.id ? "border-pitch-400 bg-pitch-500/15 text-pitch-200" : "border-white/10 text-white/60 hover:bg-white/5"
              )}
            >
              {e.nombre}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar alumno o matrícula" className="bg-white/5 border-white/10 pl-9" />
        </div>
      </div>

      {visibles.length === 0 ? (
        <Card className="glass-panel p-10 text-center text-white/50">
          <ClipboardCheck className="mx-auto mb-3 h-8 w-8 text-white/30" />
          {alumnos.length === 0 ? "Aún no hay alumnos en los equipos del colegio." : "Ningún alumno coincide con la búsqueda."}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map((a) => {
            const avance = avanceCaptura(a.perfil);
            const promedio = promedioAtributos(a.perfil);
            const nivel = nivelAtributo(promedio);
            return (
              <button key={a.id} type="button" onClick={() => abrir(a)} className="text-left">
                <Card className="glass-panel h-full p-4 transition-colors hover:border-pitch-400/40">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-display text-lg font-bold">
                      {a.dorsal ?? a.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{a.nombre}</p>
                      <p className="truncate text-xs text-white/50">
                        {a.posicion} · {a.equipoNombre}
                        {a.perfil?.matricula ? ` · Mat. ${a.perfil.matricula}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold leading-none">{promedio ?? "—"}</p>
                      {nivel && <p className={cn("text-[10px] font-semibold uppercase", nivel.color)}>{nivel.label}</p>}
                    </div>
                  </div>
                  {a.perfil?.rolPrincipal && <p className="mt-3 text-xs text-white/60">Rol: {a.perfil.rolPrincipal}</p>}
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-white/40">
                      <span>Captura</span>
                      <span>{avance}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className={cn("h-full rounded-full", avance === 100 ? "bg-pitch-400" : "bg-gold-400")} style={{ width: `${avance}%` }} />
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={!!abierto} onOpenChange={(open) => !open && setAbierto(null)}>
        <DialogContent className="glass-panel border-white/10 max-h-[92vh] max-w-3xl overflow-y-auto">
          {abierto && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-display">{abierto.nombre}</DialogTitle>
                <DialogDescription className="text-white/50">
                  {abierto.posicion} · {abierto.equipoNombre}
                  {edad(abierto.fechaNacimiento) != null ? ` · ${edad(abierto.fechaNacimiento)} años` : ""}
                  {abierto.dorsal != null ? ` · #${abierto.dorsal}` : ""}
                </DialogDescription>
              </DialogHeader>

              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid w-full grid-cols-4 bg-white/5">
                  <TabsTrigger value="ficha">Ficha</TabsTrigger>
                  <TabsTrigger value="perfil">Perfil</TabsTrigger>
                  <TabsTrigger value="atributos">Atributos</TabsTrigger>
                  <TabsTrigger value="competicion">Competición</TabsTrigger>
                </TabsList>

                <TabsContent value="ficha" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Campo label="Matrícula" hint="Número único del alumno, solo números.">
                    <Input inputMode="numeric" value={form.matricula} onChange={(e) => set("matricula", e.target.value.replace(/\D/g, ""))} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Categoría" hint="Categoría competitiva o condición de registro.">
                    <Select value={form.categoriaCompetitiva || undefined} onValueChange={(v) => set("categoriaCompetitiva", v)}>
                      <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS_COMPETITIVAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Campo>
                  <Campo label="Estatura (m)" hint="Ejemplo: 1.58">
                    <Input inputMode="decimal" value={form.estatura} onChange={(e) => set("estatura", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Peso (kg)" hint="Ejemplo: 45">
                    <Input inputMode="decimal" value={form.peso} onChange={(e) => set("peso", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Pie dominante">
                    <Select value={form.pieDominante || undefined} onValueChange={(v) => set("pieDominante", v)}>
                      <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                      <SelectContent>
                        {PIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Campo>
                  <div className="hidden sm:block" />
                  <Campo label="Rol principal" hint="Ej. Central constructor, Lateral profundo, Pivote organizador.">
                    <Input value={form.rolPrincipal} onChange={(e) => set("rolPrincipal", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Rol secundario" hint="Función alternativa que desempeña con solvencia.">
                    <Input value={form.rolSecundario} onChange={(e) => set("rolSecundario", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                </TabsContent>

                <TabsContent value="perfil" className="mt-4 space-y-4">
                  <Campo label="Perfil técnico-táctico" hint="Síntesis de 2 a 4 líneas sobre su forma de jugar, decisiones y comportamientos.">
                    <Textarea rows={3} value={form.perfilTecnicoTactico} onChange={(e) => set("perfilTecnicoTactico", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Fortalezas" hint="De 3 a 5 fortalezas, separadas con punto y coma.">
                    <Textarea rows={2} value={form.fortalezas} onChange={(e) => set("fortalezas", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Áreas de oportunidad" hint="De 1 a 3 aspectos, redactados de forma accionable.">
                    <Textarea rows={2} value={form.areasOportunidad} onChange={(e) => set("areasOportunidad", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Objetivo individual" hint="Meta observable para el periodo. Ej. elevar la precisión de pase bajo presión.">
                    <Input value={form.objetivoIndividual} onChange={(e) => set("objetivoIndividual", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                  <Campo label="Observaciones del entrenador" hint="Lesión, adaptación, disponibilidad o notas de evaluación.">
                    <Textarea rows={2} value={form.observacionesEntrenador} onChange={(e) => set("observacionesEntrenador", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                </TabsContent>

                <TabsContent value="atributos" className="mt-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_240px]">
                    <div className="space-y-4">
                      {ATRIBUTOS.map((a) => {
                        const valor = form[a.key];
                        const nivel = nivelAtributo(valor === "" ? null : Number(valor));
                        return (
                          <div key={a.key}>
                            <div className="flex items-baseline justify-between gap-2">
                              <Label className="text-white/80">{a.label}</Label>
                              <span className="text-sm">
                                <span className="font-display text-lg font-bold">{valor || "—"}</span>
                                {nivel && <span className={cn("ml-2 text-[10px] font-semibold uppercase", nivel.color)}>{nivel.label}</span>}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={10}
                              step={0.5}
                              value={valor || 1}
                              onChange={(e) => set(a.key, e.target.value)}
                              aria-label={a.label}
                              className={cn("w-full accent-pitch-400", !valor && "opacity-40")}
                            />
                            <p className="text-[11px] text-white/40">{a.descripcion}</p>
                          </div>
                        );
                      })}
                      <p className="text-[11px] text-white/40">
                        Escala: 1-3 incipiente · 4-5 básico · 6-7 funcional · 8-9 alto nivel · 10 sobresaliente.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 md:sticky md:top-0 md:self-start">
                      <RadarAtributos valores={form} />
                      <p className="text-center text-xs text-white/50">Promedio</p>
                      <p className="text-center font-display text-3xl font-bold">{promedioForm ?? "—"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="competicion" className="mt-4 space-y-4">
                  <div className="flex flex-col gap-2 rounded-xl border border-pitch-500/20 bg-pitch-500/5 p-3 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Registrado en Club One: {abierto.estadisticas.partidosJugados} partidos · {abierto.estadisticas.goles} goles ·{" "}
                      {abierto.estadisticas.tarjetasAmarillas} amarillas · {abierto.estadisticas.tarjetasRojas} rojas
                    </span>
                    <Button type="button" size="sm" variant="outline" onClick={usarEstadisticas} className="border-pitch-500/30 text-pitch-200 hover:bg-pitch-500/10">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Usar estos datos
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      ["partidosJugados", "Partidos jugados"], ["partidosTitular", "Titular"], ["partidosSuplente", "Suplente"],
                      ["minutos", "Minutos"], ["participaciones", "Participaciones"], ["goles", "Goles"],
                      ["asistenciasGol", "Asistencias"], ["torneos", "Torneos"], ["tarjetasAmarillas", "Tarjetas amarillas"],
                      ["tarjetasRojas", "Tarjetas rojas"],
                    ].map(([campo, label]) => (
                      <Campo key={campo} label={label}>
                        <Input inputMode="numeric" value={form[campo]} onChange={(e) => set(campo, e.target.value.replace(/\D/g, ""))} className="bg-white/5 border-white/10" />
                      </Campo>
                    ))}
                    <Campo label="Actitud deportiva">
                      <Input value={form.actitudDeportiva} onChange={(e) => set("actitudDeportiva", e.target.value)} className="bg-white/5 border-white/10" />
                    </Campo>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <Campo key={i} label={`Liga ${i + 1}`}>
                        <Input value={form[`liga${i}`]} onChange={(e) => set(`liga${i}`, e.target.value)} className="bg-white/5 border-white/10" />
                      </Campo>
                    ))}
                  </div>
                  <Campo label="Observaciones de competición">
                    <Textarea rows={2} value={form.observacionesCompeticion} onChange={(e) => set("observacionesCompeticion", e.target.value)} className="bg-white/5 border-white/10" />
                  </Campo>
                </TabsContent>
              </Tabs>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button asChild variant="outline" className="border-white/10">
                  <a href={exportUrl({ jugadorId: abierto.id })}>
                    <Download className="mr-2 h-4 w-4" /> Perfil en Excel
                  </a>
                </Button>
                <Button onClick={guardar} disabled={guardando} className="bg-pitch-500 font-semibold text-dark-900 hover:bg-pitch-400">
                  {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar perfil
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { z } from "zod";

/** Atributos de la rúbrica deportiva, en el orden de la plantilla (columnas S a Z). */
export const ATRIBUTOS = [
  { key: "gestoTecnico", label: "Gesto técnico", grupo: "Técnico", descripcion: "Control, primer toque, conducción y ejecución técnica bajo presión." },
  { key: "participacionJuego", label: "Participación en juego", grupo: "Técnico", descripcion: "Escaneo, lectura de opciones y anticipación de soluciones." },
  { key: "paseAcertado", label: "Pase acertado", grupo: "Técnico", descripcion: "Calidad, precisión, peso, variedad y selección de los pases." },
  { key: "velocidad", label: "Velocidad", grupo: "Físico", descripcion: "Aceleración, velocidad de desplazamiento y recuperación." },
  { key: "agilidad", label: "Agilidad", grupo: "Físico", descripcion: "Cambios de dirección, coordinación, equilibrio y reacción." },
  { key: "resistencia", label: "Resistencia", grupo: "Físico", descripcion: "Capacidad de sostener esfuerzos e intensidad durante el partido." },
  { key: "fuerza", label: "Fuerza", grupo: "Físico", descripcion: "Capacidad para proteger balón, resistir contacto y competir en duelos." },
  { key: "aptitudDeportiva", label: "Aptitud deportiva", grupo: "Actitud", descripcion: "Iniciativa, compromiso y actitud para presionar, recuperar y replegar." },
] as const;

export type AtributoKey = (typeof ATRIBUTOS)[number]["key"];

export const PIES = ["Derecho", "Izquierdo", "Ambidiestro"] as const;
export const CATEGORIAS_COMPETITIVAS = ["Mayor", "Mediano", "Menor"] as const;

/** Escala de la guía de llenado (1-10). */
export function nivelAtributo(valor: number | null | undefined) {
  if (valor == null) return null;
  if (valor >= 10) return { label: "Sobresaliente", color: "text-gold-400" };
  if (valor >= 8) return { label: "Alto nivel", color: "text-pitch-300" };
  if (valor >= 6) return { label: "Funcional", color: "text-sky-300" };
  if (valor >= 4) return { label: "Básico", color: "text-amber-300" };
  return { label: "Incipiente", color: "text-red-300" };
}

const texto = (max: number) => z.string().trim().max(max).nullable().optional().transform((v) => v || null);
const entero = z.number().int().min(0).max(100000).nullable().optional();
const nota = z.number().min(1).max(10).multipleOf(0.5).nullable().optional();

export const perfilDeportivoSchema = z.object({
  matricula: z.string().trim().max(30).regex(/^\d*$/, "La matrícula solo admite números").nullable().optional().transform((v) => v || null),
  categoriaCompetitiva: texto(40),
  estatura: z.number().min(0.8).max(2.3).nullable().optional(),
  peso: z.number().min(15).max(150).nullable().optional(),
  pieDominante: z.enum(PIES).nullable().optional(),
  rolPrincipal: texto(80),
  rolSecundario: texto(80),
  perfilTecnicoTactico: texto(1000),
  fortalezas: texto(600),
  areasOportunidad: texto(600),
  objetivoIndividual: texto(300),
  observacionesEntrenador: texto(1000),
  gestoTecnico: nota,
  participacionJuego: nota,
  paseAcertado: nota,
  velocidad: nota,
  agilidad: nota,
  resistencia: nota,
  fuerza: nota,
  aptitudDeportiva: nota,
  partidosJugados: entero,
  partidosTitular: entero,
  partidosSuplente: entero,
  minutos: entero,
  participaciones: entero,
  actitudDeportiva: texto(80),
  goles: entero,
  asistenciasGol: entero,
  torneos: entero,
  tarjetasAmarillas: entero,
  tarjetasRojas: entero,
  ligas: z.array(z.string().trim().max(80)).max(3).optional().transform((v) => (v ?? []).filter(Boolean)),
  observacionesCompeticion: texto(1000),
});

export type PerfilDeportivoInput = z.input<typeof perfilDeportivoSchema>;
export type PerfilDeportivo = z.output<typeof perfilDeportivoSchema> & {
  id?: string;
  updatedAt?: string;
};

export function promedioAtributos(perfil: Partial<Record<AtributoKey, number | string | null>> | null | undefined) {
  if (!perfil) return null;
  const valores = ATRIBUTOS.map((a) => perfil[a.key]).filter((v) => v != null && v !== "").map(Number);
  if (!valores.length) return null;
  return Math.round((valores.reduce((s, v) => s + v, 0) / valores.length) * 10) / 10;
}

/** Porcentaje de columnas de la plantilla capturadas (ficha, perfil y atributos). */
export function avanceCaptura(perfil: Record<string, unknown> | null | undefined) {
  const campos = [
    "matricula", "categoriaCompetitiva", "estatura", "peso", "pieDominante", "rolPrincipal", "rolSecundario",
    "perfilTecnicoTactico", "fortalezas", "areasOportunidad", "objetivoIndividual", "observacionesEntrenador",
    ...ATRIBUTOS.map((a) => a.key),
  ];
  if (!perfil) return 0;
  const llenos = campos.filter((c) => perfil[c] != null && perfil[c] !== "").length;
  return Math.round((llenos / campos.length) * 100);
}

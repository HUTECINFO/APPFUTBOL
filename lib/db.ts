import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";

type Relation =
  | { kind: "one"; model: string; local: string; foreign?: string }
  | { kind: "many"; model: string; foreign: string; local?: string }
  | { kind: "manyToMany"; model: string; join: string; source: string; target: string };

type ModelConfig = {
  table: string;
  id?: boolean;
  updatedAt?: boolean;
  defaults?: (row: Record<string, any>) => void;
  relations?: Record<string, Relation>;
};

const models: Record<string, ModelConfig> = {
  club: { table: "clubs", id: true, updatedAt: true, relations: {
    sedes: { kind: "many", model: "sede", foreign: "clubId" }, equipos: { kind: "many", model: "equipo", foreign: "clubId" },
    admins: { kind: "manyToMany", model: "usuario", join: "_ClubAdmins", source: "A", target: "B" },
    ingresos: { kind: "many", model: "ingresoClub", foreign: "clubId" }, invitaciones: { kind: "many", model: "invitacionClub", foreign: "clubId" },
    solicitudes: { kind: "many", model: "solicitudInscripcion", foreign: "clubId" },
  } },
  sede: { table: "sedes", id: true, updatedAt: true, relations: {
    club: { kind: "one", model: "club", local: "clubId" }, eventos: { kind: "many", model: "evento", foreign: "sedeId" },
  } },
  equipo: { table: "equipos", id: true, updatedAt: true, relations: {
    club: { kind: "one", model: "club", local: "clubId" }, entrenador: { kind: "one", model: "usuario", local: "entrenadorId" },
    jugadores: { kind: "many", model: "jugador", foreign: "equipoId" }, eventos: { kind: "many", model: "evento", foreign: "equipoId" },
    formaciones: { kind: "many", model: "formacion", foreign: "equipoId" }, chats: { kind: "many", model: "chat", foreign: "equipoId" },
    solicitudes: { kind: "many", model: "solicitudInscripcion", foreign: "equipoId" },
  } },
  usuario: { table: "usuarios", id: true, updatedAt: true, relations: {
    clubesAdmin: { kind: "manyToMany", model: "club", join: "_ClubAdmins", source: "B", target: "A" },
    equiposCoach: { kind: "many", model: "equipo", foreign: "entrenadorId" }, jugador: { kind: "many", model: "jugador", foreign: "usuarioId" },
    tutorDe: { kind: "many", model: "jugador", foreign: "tutorId" }, cuentas: { kind: "many", model: "account", foreign: "userId" },
    sesiones: { kind: "many", model: "session", foreign: "userId" }, mensajesChat: { kind: "many", model: "mensajeChat", foreign: "autorId" },
    pagosProcesados: { kind: "many", model: "pago", foreign: "procesadoPorId" }, solicitudesRevisadas: { kind: "many", model: "solicitudInscripcion", foreign: "revisadoPorId" },
    backgroundChecks: { kind: "many", model: "backgroundCheck", foreign: "usuarioId" },
  } },
  account: { table: "accounts", id: true, relations: { user: { kind: "one", model: "usuario", local: "userId" } } },
  session: { table: "sessions", id: true, relations: { user: { kind: "one", model: "usuario", local: "userId" } } },
  verificationToken: { table: "verification_tokens", id: false },
  jugador: { table: "jugadores", id: true, updatedAt: true, defaults: row => { row.idQrCode ??= randomUUID(); }, relations: {
    usuario: { kind: "one", model: "usuario", local: "usuarioId" }, equipo: { kind: "one", model: "equipo", local: "equipoId" },
    tutor: { kind: "one", model: "usuario", local: "tutorId" }, mensualidades: { kind: "many", model: "mensualidad", foreign: "jugadorId" },
    asistencias: { kind: "many", model: "asistencia", foreign: "jugadorId" }, goles: { kind: "many", model: "gol", foreign: "jugadorId" },
    tarjetas: { kind: "many", model: "tarjeta", foreign: "jugadorId" }, cambiosEntra: { kind: "many", model: "cambio", foreign: "jugadorEntraId" },
    cambiosSale: { kind: "many", model: "cambio", foreign: "jugadorSaleId" }, evaluaciones: { kind: "many", model: "evaluacion", foreign: "jugadorId" },
  } },
  evento: { table: "eventos", id: true, updatedAt: true, relations: {
    equipo: { kind: "one", model: "equipo", local: "equipoId" }, sede: { kind: "one", model: "sede", local: "sedeId" },
    asistencias: { kind: "many", model: "asistencia", foreign: "eventoId" }, goles: { kind: "many", model: "gol", foreign: "eventoId" },
    tarjetas: { kind: "many", model: "tarjeta", foreign: "eventoId" }, cambios: { kind: "many", model: "cambio", foreign: "eventoId" },
  } },
  asistencia: { table: "asistencias", id: true, updatedAt: true, relations: {
    evento: { kind: "one", model: "evento", local: "eventoId" }, jugador: { kind: "one", model: "jugador", local: "jugadorId" },
  } },
  mensualidad: { table: "mensualidades", id: true, updatedAt: true, relations: {
    jugador: { kind: "one", model: "jugador", local: "jugadorId" }, pagos: { kind: "many", model: "pago", foreign: "mensualidadId" },
  } },
  pago: { table: "pagos", id: true, relations: {
    mensualidad: { kind: "one", model: "mensualidad", local: "mensualidadId" }, procesadoPor: { kind: "one", model: "usuario", local: "procesadoPorId" },
  } },
  ingresoClub: { table: "ingresos_club", id: true, relations: { club: { kind: "one", model: "club", local: "clubId" } } },
  formacion: { table: "formaciones", id: true, updatedAt: true, relations: { equipo: { kind: "one", model: "equipo", local: "equipoId" } } },
  gol: { table: "goles", id: true, relations: { evento: { kind: "one", model: "evento", local: "eventoId" }, jugador: { kind: "one", model: "jugador", local: "jugadorId" } } },
  tarjeta: { table: "tarjetas", id: true, relations: { evento: { kind: "one", model: "evento", local: "eventoId" }, jugador: { kind: "one", model: "jugador", local: "jugadorId" } } },
  cambio: { table: "cambios", id: true, relations: {
    evento: { kind: "one", model: "evento", local: "eventoId" }, jugadorEntra: { kind: "one", model: "jugador", local: "jugadorEntraId" },
    jugadorSale: { kind: "one", model: "jugador", local: "jugadorSaleId" },
  } },
  evaluacion: { table: "evaluaciones", id: true, updatedAt: true, relations: { jugador: { kind: "one", model: "jugador", local: "jugadorId" } } },
  chat: { table: "chats", id: true, updatedAt: true, relations: {
    equipo: { kind: "one", model: "equipo", local: "equipoId" }, mensajes: { kind: "many", model: "mensajeChat", foreign: "chatId" },
    miembros: { kind: "many", model: "chatMiembro", foreign: "chatId" },
  } },
  chatMiembro: { table: "chat_miembros", id: true, relations: { chat: { kind: "one", model: "chat", local: "chatId" } } },
  mensajeChat: { table: "mensajes_chat", id: true, relations: {
    chat: { kind: "one", model: "chat", local: "chatId" }, autor: { kind: "one", model: "usuario", local: "autorId" },
  } },
  invitacionClub: { table: "invitaciones_club", id: true, relations: { club: { kind: "one", model: "club", local: "clubId" } } },
  webhookLog: { table: "webhook_logs", id: true },
  solicitudInscripcion: { table: "solicitudes_inscripcion", id: true, updatedAt: true, relations: {
    club: { kind: "one", model: "club", local: "clubId" }, equipo: { kind: "one", model: "equipo", local: "equipoId" },
    revisadoPor: { kind: "one", model: "usuario", local: "revisadoPorId" },
  } },
  backgroundCheck: { table: "background_checks", id: true, updatedAt: true, relations: { usuario: { kind: "one", model: "usuario", local: "usuarioId" } } },
  auditLog: { table: "audit_logs", id: true },
};

const dateFields = new Set([
  "createdAt", "updatedAt", "emailVerified", "expires", "fechaNacimiento", "fecha", "fechaPago", "ultimaLeido",
  "expiraEn", "waiverAceptadoEn", "revisadoEn", "fechaInicio", "fechaFin", "firmadoEn",
  "cupoReservadoHasta", "checkedInAt",
]);

function fromDatabase(value: any): any {
  if (Array.isArray(value)) return value.map(fromDatabase);
  if (!value || typeof value !== "object") return value;
  const result: Record<string, any> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = dateFields.has(key) && typeof item === "string" ? new Date(item) : fromDatabase(item);
  }
  return result;
}

function toDatabase(value: any): any {
  if (value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toDatabase);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toDatabase(item)]));
  return value;
}

function dbError(error: any): never {
  const wrapped: any = new Error(error?.message ?? "Supabase database error");
  wrapped.code = error?.code === "23505" ? "P2002" : error?.code;
  wrapped.details = error?.details;
  throw wrapped;
}

async function all(model: string) {
  const { data, error } = await supabaseAdmin.from(models[model].table).select("*");
  if (error) dbError(error);
  return fromDatabase(data ?? []);
}

async function related(model: string, row: any, name: string, args: any = {}) {
  const relation = models[model].relations?.[name];
  if (!relation) return undefined;
  if (relation.kind === "one") {
    const value = row[relation.local];
    if (value == null) return null;
    return findFirst(relation.model, { ...args, where: { ...(args.where ?? {}), [relation.foreign ?? "id"]: value } });
  }
  if (relation.kind === "many") {
    return findMany(relation.model, { ...args, where: { ...(args.where ?? {}), [relation.foreign]: row[relation.local ?? "id"] } });
  }

  const { data: links, error } = await supabaseAdmin.from(relation.join).select(relation.target).eq(relation.source, row.id);
  if (error) dbError(error);
  const ids = (links ?? []).map((link: any) => link[relation.target]);
  return ids.length ? findMany(relation.model, { ...args, where: { ...(args.where ?? {}), id: { in: ids } } }) : [];
}

function scalarMatch(actual: any, expected: any) {
  if (expected instanceof Date) return new Date(actual).getTime() === expected.getTime();
  if (!expected || typeof expected !== "object" || Array.isArray(expected)) return actual === expected;
  if ("equals" in expected && !scalarMatch(actual, expected.equals)) return false;
  if ("in" in expected && !expected.in.includes(actual)) return false;
  if ("notIn" in expected && expected.notIn.includes(actual)) return false;
  if ("lt" in expected && !(actual < expected.lt)) return false;
  if ("lte" in expected && !(actual <= expected.lte)) return false;
  if ("gt" in expected && !(actual > expected.gt)) return false;
  if ("gte" in expected && !(actual >= expected.gte)) return false;
  if ("contains" in expected && !String(actual ?? "").toLowerCase().includes(String(expected.contains).toLowerCase())) return false;
  if ("startsWith" in expected && !String(actual ?? "").startsWith(expected.startsWith)) return false;
  if ("endsWith" in expected && !String(actual ?? "").endsWith(expected.endsWith)) return false;
  if ("not" in expected && scalarMatch(actual, expected.not)) return false;
  return true;
}

async function matches(model: string, row: any, where: any): Promise<boolean> {
  if (!where) return true;
  if (where.AND && !(await Promise.all((Array.isArray(where.AND) ? where.AND : [where.AND]).map((item: any) => matches(model, row, item)))).every(Boolean)) return false;
  if (where.OR && !(await Promise.all(where.OR.map((item: any) => matches(model, row, item)))).some(Boolean)) return false;
  if (where.NOT && (await matches(model, row, where.NOT))) return false;

  for (const [key, expected] of Object.entries(where)) {
    if (["AND", "OR", "NOT"].includes(key)) continue;
    const relation = models[model].relations?.[key];
    if (relation) {
      const value = await related(model, row, key);
      const condition: any = expected;
      if (Array.isArray(value)) {
        if (condition.some && !(await Promise.all(value.map(item => matches(relation.model, item, condition.some)))).some(Boolean)) return false;
        if (condition.none && (await Promise.all(value.map(item => matches(relation.model, item, condition.none)))).some(Boolean)) return false;
        if (condition.every && !(await Promise.all(value.map(item => matches(relation.model, item, condition.every)))).every(Boolean)) return false;
      } else {
        const nested = condition.is ?? condition;
        if (value == null || !(await matches(relation.model, value, nested))) return false;
      }
    } else if (!(key in row) && expected && typeof expected === "object" && !Array.isArray(expected)) {
      // Filtros únicos compuestos como eventoId_jugadorId.
      if (!(await matches(model, row, expected))) return false;
    } else if (!scalarMatch(row[key], expected)) return false;
  }
  return true;
}

function compareRows(orderBy: any) {
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return (a: any, b: any) => {
    for (const order of orders) {
      const [field, direction] = Object.entries(order ?? {})[0] ?? [];
      if (!field || a[field] === b[field]) continue;
      return (a[field] > b[field] ? 1 : -1) * (direction === "desc" ? -1 : 1);
    }
    return 0;
  };
}

async function shape(model: string, row: any, args: any) {
  if (!row) return row;
  const output: Record<string, any> = args?.select ? {} : { ...row };
  const spec = args?.select ?? args?.include ?? {};
  for (const [key, option] of Object.entries(spec)) {
    if (!option) continue;
    if (key === "_count") {
      output._count = {};
      for (const [name, enabled] of Object.entries((option as any).select ?? {})) {
        if (enabled) output._count[name] = (await related(model, row, name))?.length ?? 0;
      }
    } else if (models[model].relations?.[key]) {
      output[key] = await related(model, row, key, option === true ? {} : option);
    } else if (args?.select) output[key] = row[key];
  }
  return output;
}

async function findMany(model: string, args: any = {}) {
  let rows = (await all(model)).filter(Boolean);
  if (args.where) {
    const checks = await Promise.all(rows.map((row: any) => matches(model, row, args.where)));
    rows = rows.filter((_: any, index: number) => checks[index]);
  }
  if (args.orderBy) rows.sort(compareRows(args.orderBy));
  if (args.distinct) {
    const fields = Array.isArray(args.distinct) ? args.distinct : [args.distinct];
    const seen = new Set<string>();
    rows = rows.filter((row: any) => { const key = JSON.stringify(fields.map((field: string) => row[field])); if (seen.has(key)) return false; seen.add(key); return true; });
  }
  rows = rows.slice(args.skip ?? 0, args.take == null ? undefined : (args.skip ?? 0) + args.take);
  return Promise.all(rows.map((row: any) => shape(model, row, args)));
}

async function findFirst(model: string, args: any = {}) {
  return (await findMany(model, { ...args, take: 1 }))[0] ?? null;
}

async function insert(model: string, input: any) {
  const config = models[model];
  const data = { ...input };
  const nested: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const relation = config.relations?.[key];
    if (!relation) continue;
    nested[key] = data[key];
    if (relation.kind === "one" && data[key]?.connect) data[relation.local] = data[key].connect.id;
    delete data[key];
  }
  if (config.id && !data.id) data.id = randomUUID();
  if (config.updatedAt) data.updatedAt = new Date().toISOString();
  config.defaults?.(data);
  const { data: created, error } = await supabaseAdmin.from(config.table).insert(toDatabase(data)).select().single();
  if (error) dbError(error);
  const row = fromDatabase(created);

  for (const [name, operation] of Object.entries(nested)) {
    const relation = config.relations![name];
    const op: any = operation;
    if (relation.kind === "manyToMany" && op.connect) {
      const items = Array.isArray(op.connect) ? op.connect : [op.connect];
      const links = items.map((item: any) => ({ [relation.source]: row.id, [relation.target]: item.id }));
      const { error: linkError } = await supabaseAdmin.from(relation.join).upsert(links);
      if (linkError) dbError(linkError);
    } else if (relation.kind === "manyToMany" && op.create) {
      const items = Array.isArray(op.create) ? op.create : [op.create];
      for (const item of items) {
        const target = await insert(relation.model, item);
        const { error: linkError } = await supabaseAdmin
          .from(relation.join)
          .insert({ [relation.source]: row.id, [relation.target]: target.id });
        if (linkError) dbError(linkError);
      }
    } else if (relation.kind === "many" && op.create) {
      const items = Array.isArray(op.create) ? op.create : [op.create];
      for (const item of items) await insert(relation.model, { ...item, [relation.foreign]: row.id });
    }
  }
  return row;
}

function applyUpdate(row: any, changes: any) {
  const next: Record<string, any> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if ("increment" in value) next[key] = Number(row[key] ?? 0) + Number((value as any).increment);
      else if ("decrement" in value) next[key] = Number(row[key] ?? 0) - Number((value as any).decrement);
      else if ("set" in value) next[key] = (value as any).set;
      else continue;
    } else next[key] = value;
  }
  return next;
}

function client(model: string) {
  const config = models[model];
  return {
    findMany: (args?: any) => findMany(model, args),
    findFirst: (args?: any) => findFirst(model, args),
    findUnique: (args?: any) => findFirst(model, args),
    count: async (args?: any) => (await findMany(model, { where: args?.where })).length,
    aggregate: async (args?: any) => {
      const rows = await findMany(model, { where: args?.where });
      const result: any = {};
      if (args?._sum) result._sum = Object.fromEntries(Object.keys(args._sum).map(key => [key, rows.reduce((sum: number, row: any) => sum + Number(row[key] ?? 0), 0)]));
      return result;
    },
    create: async (args: any) => shape(model, await insert(model, args.data), args),
    update: async (args: any) => {
      const current = await findFirst(model, { where: args.where });
      if (!current) throw new Error(`${model} not found`);
      const relationChanges: Record<string, any> = {};
      const scalarChanges: Record<string, any> = {};
      for (const [key, value] of Object.entries(args.data ?? {})) (config.relations?.[key] ? relationChanges : scalarChanges)[key] = value;
      const changes = applyUpdate(current, scalarChanges);
      if (config.updatedAt) changes.updatedAt = new Date();
      const query = supabaseAdmin.from(config.table).update(toDatabase(changes));
      const result = current.id != null ? query.eq("id", current.id) : query;
      const { data, error } = await result.select().single();
      if (error) dbError(error);
      for (const [name, operation] of Object.entries(relationChanges)) {
        const relation = config.relations![name]; const op: any = operation;
        if (relation.kind === "manyToMany" && op.connect) {
          const items = Array.isArray(op.connect) ? op.connect : [op.connect];
          const { error: linkError } = await supabaseAdmin.from(relation.join).upsert(items.map((item: any) => ({ [relation.source]: current.id, [relation.target]: item.id })));
          if (linkError) dbError(linkError);
        }
      }
      return shape(model, fromDatabase(data), args);
    },
    updateMany: async (args: any) => {
      const rows = await findMany(model, { where: args.where });
      await Promise.all(rows.map((row: any) => (db as any)[model].update({ where: { id: row.id }, data: args.data })));
      return { count: rows.length };
    },
    createMany: async (args: any) => { const rows = await Promise.all(args.data.map((item: any) => insert(model, item))); return { count: rows.length }; },
    upsert: async (args: any) => {
      const current = await findFirst(model, { where: args.where });
      return current ? (db as any)[model].update({ where: args.where, data: args.update, include: args.include, select: args.select }) : (db as any)[model].create({ data: args.create, include: args.include, select: args.select });
    },
    delete: async (args: any) => {
      const current = await findFirst(model, { where: args.where });
      if (!current) throw new Error(`${model} not found`);
      const query = supabaseAdmin.from(config.table).delete();
      const { error } = current.id != null ? await query.eq("id", current.id) : await query;
      if (error) dbError(error);
      return current;
    },
    deleteMany: async (args: any = {}) => {
      const rows = await findMany(model, { where: args.where });
      if (!rows.length) return { count: 0 };
      const ids = rows.map((row: any) => row.id).filter(Boolean);
      const { error } = await supabaseAdmin.from(config.table).delete().in("id", ids);
      if (error) dbError(error);
      return { count: rows.length };
    },
  };
}

export const db: any = Object.fromEntries(Object.keys(models).map(model => [model, client(model)]));

db.$transaction = async (input: any) => typeof input === "function" ? input(db) : Promise.all(input);
db.$queryRaw = async () => {
  const { error } = await supabaseAdmin.from("clubs").select("id", { head: true, count: "exact" }).limit(1);
  if (error) dbError(error);
  return [];
};
db.$disconnect = async () => undefined;

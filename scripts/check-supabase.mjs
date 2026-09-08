import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = [
  "clubs",
  "usuarios",
  "sedes",
  "equipos",
  "jugadores",
  "solicitudes_inscripcion",
  "formaciones",
  "mensualidades",
  "pagos",
];

let failed = false;
for (const table of tables) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) {
    failed = true;
    console.log(`${table}: ERROR ${error.code || "UNKNOWN"} ${error.message}`);
  } else {
    console.log(`${table}: OK (${count ?? 0})`);
  }
}

const { data: clubs, error: clubsError } = await supabase
  .from("clubs")
  .select("id,nombre,slug,activo")
  .order("nombre");

if (clubsError) {
  failed = true;
} else {
  console.log(`clubes: ${clubs?.map((club) => `${club.nombre} [${club.slug}]`).join(", ") || "ninguno"}`);
}

process.exitCode = failed ? 1 : 0;

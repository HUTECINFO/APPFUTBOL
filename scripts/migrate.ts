import { promises as fs } from "fs";
import path from "path";
import { Client } from "pg";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "Falta SUPABASE_DB_URL. Copia temporalmente el Session pooler de Supabase (puerto 5432) en .env.local."
  );
}

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const client = new Client({ connectionString });

async function migrate() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.app_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const exists = await client.query(
      "SELECT 1 FROM public.app_migrations WHERE name = $1",
      [file]
    );
    if (exists.rowCount) {
      console.log(`Omitida: ${file}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO public.app_migrations (name) VALUES ($1)",
        [file]
      );
      await client.query("COMMIT");
      console.log(`Aplicada: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
}

migrate()
  .then(() => console.log("Migraciones de Supabase completadas."))
  .finally(() => client.end());

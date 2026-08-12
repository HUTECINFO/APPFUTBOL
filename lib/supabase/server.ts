import { createClient } from "@supabase/supabase-js";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required Supabase environment variable: ${name}`);
  return value;
}

function publicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

function serviceKey() {
  return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

/**
 * Server-only client. It intentionally uses the secret/service key so API routes
 * can enforce this application's existing authorization rules before accessing
 * data. Never import this module from a Client Component.
 */
export function createSupabaseAdmin() {
  const key = serviceKey();
  if (!key) {
    throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(required("NEXT_PUBLIC_SUPABASE_URL"), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Client configuration for browser-safe code. */
export function createSupabasePublicClient() {
  const key = publicKey();
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(required("NEXT_PUBLIC_SUPABASE_URL"), key);
}

export const supabaseAdmin = createSupabaseAdmin();

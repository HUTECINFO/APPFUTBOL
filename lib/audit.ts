import { supabaseAdmin } from "@/lib/supabase/server";

type AuditInput = {
  clubId?: string;
  entidad: string;
  entidadId: string;
  accion: string;
  actorId: string;
  actorRol: string;
  cambios?: Record<string, unknown> | Array<unknown> | string | number | boolean | null;
  ip?: string;
  userAgent?: string;
};

export async function logAudit(input: AuditInput) {
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .insert({
      clubId: input.clubId ?? null,
      entidad: input.entidad,
      entidadId: input.entidadId,
      accion: input.accion,
      actorId: input.actorId,
      actorRol: input.actorRol,
      cambios: input.cambios ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

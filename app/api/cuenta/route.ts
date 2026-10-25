import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  password: z.string().min(1).max(72),
  confirmacion: z.literal("ELIMINAR"),
});

/**
 * Elimina la cuenta del usuario autenticado (requisito de App Store y Google
 * Play). Los registros deportivos que pertenecen al club (jugadores, pagos,
 * asistencias) se conservan desvinculados de la cuenta: las llaves foráneas
 * hacia `usuarios` son ON DELETE SET NULL / CASCADE.
 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Las cuentas de super administrador no pueden eliminarse desde la app." },
      { status: 403 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Escribe ELIMINAR y tu contraseña para confirmar." }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, email, rol, password")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo verificar la cuenta." }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "La cuenta ya no existe." }, { status: 404 });
  }
  if (!user.password || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return NextResponse.json({ error: "La contraseña no es correcta." }, { status: 403 });
  }

  await logAudit({
    entidad: "usuario",
    entidadId: user.id,
    accion: "CUENTA_ELIMINADA",
    actorId: user.id,
    actorRol: user.rol,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: req.headers.get("user-agent") ?? undefined,
  }).catch(() => null);

  // chat_miembros no tiene llave foránea hacia usuarios.
  const { error: chatError } = await supabaseAdmin.from("chat_miembros").delete().eq("usuarioId", user.id);
  if (chatError) {
    return NextResponse.json({ error: "No se pudo eliminar la cuenta." }, { status: 500 });
  }

  const { error: deleteError } = await supabaseAdmin.from("usuarios").delete().eq("id", user.id);
  if (deleteError) {
    return NextResponse.json({ error: "No se pudo eliminar la cuenta." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import type { RolUsuario } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

type Actor = {
  userId: string;
  role: RolUsuario;
};

async function isClubAdmin(userId: string, clubId: string) {
  const { data } = await supabaseAdmin
    .from("_ClubAdmins")
    .select("A")
    .eq("A", clubId)
    .eq("B", userId)
    .maybeSingle();
  return Boolean(data);
}

async function teamExists(clubId: string, equipoId: string) {
  const { data } = await supabaseAdmin
    .from("equipos")
    .select("id")
    .eq("id", equipoId)
    .eq("clubId", clubId)
    .maybeSingle();
  return Boolean(data);
}

export async function canAccessClub(actor: Actor, clubId: string) {
  if (actor.role === "SUPER_ADMIN") return true;

  const [{ data: coach }, { data: player }, isAdmin] = await Promise.all([
    supabaseAdmin.from("equipos").select("id").eq("clubId", clubId).eq("entrenadorId", actor.userId).maybeSingle(),
    supabaseAdmin
      .from("jugadores")
      .select("id, equipos!inner(clubId)")
      .or(`usuarioId.eq.${actor.userId},tutorId.eq.${actor.userId}`)
      .eq("equipos.clubId", clubId)
      .maybeSingle(),
    isClubAdmin(actor.userId, clubId),
  ]);

  return Boolean(coach || player || isAdmin);
}

export async function canManageClub(actor: Actor, clubId: string) {
  return actor.role === "SUPER_ADMIN" || (actor.role === "CLUB_ADMIN" && (await isClubAdmin(actor.userId, clubId)));
}

export async function canAccessTeam(actor: Actor, clubId: string, equipoId: string) {
  if (actor.role === "SUPER_ADMIN") return teamExists(clubId, equipoId);

  const [{ data: coach }, { data: player }, isAdmin] = await Promise.all([
    supabaseAdmin
      .from("equipos")
      .select("id")
      .eq("id", equipoId)
      .eq("clubId", clubId)
      .eq("entrenadorId", actor.userId)
      .maybeSingle(),
    supabaseAdmin
      .from("jugadores")
      .select("id")
      .eq("equipoId", equipoId)
      .or(`usuarioId.eq.${actor.userId},tutorId.eq.${actor.userId}`)
      .maybeSingle(),
    isClubAdmin(actor.userId, clubId),
  ]);

  return Boolean(coach || player || isAdmin);
}

export async function canManageTeam(actor: Actor, clubId: string, equipoId: string) {
  if (actor.role === "SUPER_ADMIN") return teamExists(clubId, equipoId);
  if (actor.role === "CLUB_ADMIN") return isClubAdmin(actor.userId, clubId);
  if (actor.role !== "ENTRENADOR") return false;

  const { data } = await supabaseAdmin
    .from("equipos")
    .select("id")
    .eq("id", equipoId)
    .eq("clubId", clubId)
    .eq("entrenadorId", actor.userId)
    .maybeSingle();
  return Boolean(data);
}

export function actorFromSession(session: {
  user: { id: string; role: RolUsuario };
}): Actor {
  return { userId: session.user.id, role: session.user.role };
}

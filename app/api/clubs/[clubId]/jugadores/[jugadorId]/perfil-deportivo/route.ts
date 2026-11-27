import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub, canManageTeam } from "@/lib/authorization";
import { logAudit } from "@/lib/audit";
import { perfilDeportivoSchema } from "@/lib/rubrica";

export async function PUT(
  req: Request,
  props: { params: Promise<{ clubId: string; jugadorId: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const club = await db.club.findUnique({ where: { id: params.clubId }, select: { id: true, esColegio: true } });
  if (!club?.esColegio) return NextResponse.json({ error: "La rúbrica solo está disponible para colegios" }, { status: 404 });

  const jugador = await db.jugador.findFirst({
    where: { id: params.jugadorId, equipo: { clubId: params.clubId } },
    select: { id: true, equipoId: true },
  });
  if (!jugador) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

  const actor = actorFromSession(session);
  const canManage =
    (await canManageClub(actor, params.clubId)) ||
    (await canManageTeam(actor, params.clubId, jugador.equipoId));
  if (!canManage) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    const data = perfilDeportivoSchema.parse(await req.json());
    const before = await db.perfilDeportivo.findFirst({ where: { jugadorId: jugador.id } });

    const perfil = await db.perfilDeportivo.upsert({
      where: { jugadorId: jugador.id },
      update: { ...data, evaluadoPorId: session.user.id },
      create: { ...data, jugadorId: jugador.id, clubId: params.clubId, evaluadoPorId: session.user.id },
    });

    await logAudit({
      clubId: params.clubId,
      entidad: "jugador",
      entidadId: jugador.id,
      accion: before ? "actualizar_perfil_deportivo" : "crear_perfil_deportivo",
      actorId: session.user.id,
      actorRol: session.user.role,
      cambios: { after: data },
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(perfil);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Error al guardar el perfil" }, { status: 500 });
  }
}

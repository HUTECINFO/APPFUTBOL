import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { logAudit } from "@/lib/audit";

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "waitlist", "assign_group", "checkin", "undo_checkin"]),
  equipoId: z.string().optional(),
  posicion: z.enum(["Portero", "Defensa", "Mediocampista", "Delantero"]).optional(),
  descuentoPorcentaje: z.number().min(0).max(100).optional(),
  motivoRechazo: z.string().max(500).optional(),
  notasAdmin: z.string().max(1000).optional(),
  grupoAsignado: z.string().max(100).optional(),
  kitEntregado: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { clubId: string; solicitudId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const solicitud = await db.solicitudInscripcion.findFirst({
      where: { id: params.solicitudId, clubId: params.clubId },
    });

    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    const body = await req.json();
    const data = patchSchema.parse(body);

    if (["assign_group", "checkin", "undo_checkin"].includes(data.action)) {
      if (solicitud.estado !== "APROBADA") {
        return NextResponse.json({ error: "Solo se puede operar un registro con pago aprobado" }, { status: 400 });
      }
      const updated = await db.solicitudInscripcion.update({
        where: { id: solicitud.id },
        data: {
          ...(data.action === "assign_group" ? { grupoAsignado: data.grupoAsignado || null } : {}),
          ...(data.action === "checkin" ? { checkedInAt: new Date(), kitEntregado: data.kitEntregado ?? solicitud.kitEntregado } : {}),
          ...(data.action === "undo_checkin" ? { checkedInAt: null, kitEntregado: false } : {}),
        },
      });
      await logAudit({
        clubId: params.clubId,
        entidad: "solicitud",
        entidadId: solicitud.id,
        accion: data.action,
        actorId: session.user.id,
        actorRol: session.user.role,
        cambios: { grupoAsignado: data.grupoAsignado, kitEntregado: data.kitEntregado },
      });
      return NextResponse.json(updated);
    }

    if (solicitud.estado === "APROBADA") {
      return NextResponse.json({ error: "Esta solicitud ya fue aprobada" }, { status: 400 });
    }

    if (data.action === "reject") {
      const updated = await db.solicitudInscripcion.update({
        where: { id: solicitud.id },
        data: {
          estado: "RECHAZADA",
          motivoRechazo: data.motivoRechazo || null,
          notasAdmin: data.notasAdmin,
          revisadoPorId: session.user.id,
          revisadoEn: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    if (data.action === "waitlist") {
      const updated = await db.solicitudInscripcion.update({
        where: { id: solicitud.id },
        data: {
          estado: "LISTA_ESPERA",
          notasAdmin: data.notasAdmin,
          revisadoPorId: session.user.id,
          revisadoEn: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    // action === "approve"
    const equipoId = data.equipoId || solicitud.equipoId;
    if (!equipoId) {
      return NextResponse.json({ error: "Selecciona un equipo para aprobar la solicitud" }, { status: 400 });
    }

    const equipo = await db.equipo.findFirst({
      where: { id: equipoId, clubId: params.clubId },
    });
    if (!equipo) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    const posicion = solicitud.posicion || data.posicion;
    if (!posicion) {
      return NextResponse.json({ error: "Falta indicar la posición del jugador" }, { status: 400 });
    }

    const result = await db.$transaction(async (tx: any) => {
      const tutor = await tx.usuario.upsert({
        where: { email: solicitud.emailTutor },
        update: {
          telefono: solicitud.telefonoTutor || undefined,
        },
        create: {
          nombre: solicitud.nombreTutor,
          email: solicitud.emailTutor,
          telefono: solicitud.telefonoTutor,
          rol: "TUTOR",
        },
      });

      const jugador = await tx.jugador.create({
        data: {
          nombre: solicitud.nombreJugador,
          posicion,
          fechaNacimiento: solicitud.fechaNacimiento,
          equipoId,
          tutorId: tutor.id,
        },
      });

      const updated = await tx.solicitudInscripcion.update({
        where: { id: solicitud.id },
        data: {
          estado: "APROBADA",
          equipoId,
          jugadorCreadoId: jugador.id,
          descuentoPorcentaje: data.descuentoPorcentaje,
          notasAdmin: data.notasAdmin,
          revisadoPorId: session.user.id,
          revisadoEn: new Date(),
        },
      });

      return { solicitud: updated, jugador, tutor };
    });

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key === "x-forwarded-for" || key === "x-real-ip") headers[key] = value;
    });

    const forwarded = headers["x-forwarded-for"] || headers["x-real-ip"] || "";
    const userAgent = req.headers.get("user-agent") || "";

    await logAudit({
      clubId: params.clubId,
      entidad: "solicitud",
      entidadId: solicitud.id,
      accion: "aprobar",
      actorId: session.user.id,
      actorRol: session.user.role,
      cambios: {
        jugadorId: result.jugador.id,
        tutorId: result.tutor.id,
        descuentoPorcentaje: data.descuentoPorcentaje,
      },
      ip: forwarded || undefined,
      userAgent: userAgent || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Error al procesar la solicitud" }, { status: 500 });
  }
}

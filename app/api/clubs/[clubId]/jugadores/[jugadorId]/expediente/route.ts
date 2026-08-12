import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canManageClub, canManageTeam } from "@/lib/authorization";
import { logAudit } from "@/lib/audit";

const documentSchema = z.object({
  nombre: z.string().min(1).max(200),
  base64: z.string().min(1).refine((v) => v.startsWith("data:"), {
    message: "El documento debe ser una URL de datos válida",
  }),
  mimeType: z.string().min(1),
  uploadedAt: z.string().datetime(),
});

const updateSchema = z.object({
  contactoEmergenciaNombre: z.string().max(150).optional(),
  contactoEmergenciaTelefono: z.string().max(50).optional(),
  alergias: z.string().max(1000).optional(),
  tipoSangre: z.string().max(10).optional(),
  seguroMedicoProveedor: z.string().max(150).optional(),
  seguroMedicoPoliza: z.string().max(100).optional(),
  documentos: z.array(documentSchema).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { clubId: string; jugadorId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const jugador = await db.jugador.findFirst({
    where: { id: params.jugadorId, equipo: { clubId: params.clubId } },
    select: { id: true, nombre: true, equipoId: true },
  });
  if (!jugador) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });

  const actor = actorFromSession(session);
  const canManage =
    (await canManageClub(actor, params.clubId)) ||
    (await canManageTeam(actor, params.clubId, jugador.equipoId));
  if (!canManage) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const before = await db.jugador.findUnique({
      where: { id: params.jugadorId },
      select: {
        contactoEmergenciaNombre: true,
        contactoEmergenciaTelefono: true,
        alergias: true,
        tipoSangre: true,
        seguroMedicoProveedor: true,
        seguroMedicoPoliza: true,
        documentos: true,
      },
    });

    const updated = await db.jugador.update({
      where: { id: params.jugadorId },
      data: {
        contactoEmergenciaNombre: data.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: data.contactoEmergenciaTelefono,
        alergias: data.alergias,
        tipoSangre: data.tipoSangre,
        seguroMedicoProveedor: data.seguroMedicoProveedor,
        seguroMedicoPoliza: data.seguroMedicoPoliza,
        documentos: data.documentos,
      },
    });

    await logAudit({
      clubId: params.clubId,
      entidad: "jugador",
      entidadId: params.jugadorId,
      accion: "actualizar_expediente",
      actorId: session.user.id,
      actorRol: session.user.role,
      cambios: { before, after: data },
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Error al actualizar expediente" }, { status: 500 });
  }
}

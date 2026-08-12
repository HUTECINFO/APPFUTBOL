import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  usuarioId: z.string(),
  estado: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO", "EXPIRADO"]),
  proveedor: z.string().max(150).optional(),
  referencia: z.string().max(200).optional(),
  expiraEn: z.string().datetime().optional(),
  notas: z.string().max(1000).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const checks = await db.backgroundCheck.findMany({
    where: { clubId: params.clubId },
    orderBy: { createdAt: "desc" },
    include: {
      usuario: { select: { id: true, nombre: true, email: true, rol: true } },
    },
  });

  return NextResponse.json(checks);
}

export async function POST(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const usuario = await db.usuario.findFirst({
      where: {
        id: data.usuarioId,
        OR: [
          { clubesAdmin: { some: { id: params.clubId } } },
          { equiposCoach: { some: { clubId: params.clubId } } },
        ],
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado en el club" }, { status: 404 });
    }

    const check = await db.backgroundCheck.create({
      data: {
        clubId: params.clubId,
        usuarioId: data.usuarioId,
        estado: data.estado,
        proveedor: data.proveedor,
        referencia: data.referencia,
        expiraEn: data.expiraEn ? new Date(data.expiraEn) : null,
        notas: data.notas,
        fechaFin: data.estado === "APROBADO" || data.estado === "RECHAZADO" ? new Date() : null,
      },
    });

    await logAudit({
      clubId: params.clubId,
      entidad: "background_check",
      entidadId: check.id,
      accion: "crear",
      actorId: session.user.id,
      actorRol: session.user.role,
      cambios: { usuarioId: data.usuarioId, estado: data.estado },
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(check, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Error al crear background check" }, { status: 500 });
  }
}

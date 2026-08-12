import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub } from "@/lib/authorization";

export async function GET(
  req: Request,
  { params }: { params: { clubId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const solicitudes = await db.solicitudInscripcion.findMany({
    where: { clubId: params.clubId },
    orderBy: { createdAt: "desc" },
    include: {
      equipo: { select: { id: true, nombre: true, categoria: true } },
      revisadoPor: { select: { id: true, nombre: true } },
    },
  });

  return NextResponse.json(solicitudes);
}

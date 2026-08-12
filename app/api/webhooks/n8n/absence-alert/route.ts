import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasValidAutomationSecret } from "@/lib/webhooks";

export async function POST(req: Request) {
  if (!hasValidAutomationSecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { clubId, umbralInasistencias = 3 } = body;

    await db.webhookLog.create({
      data: {
        proveedor: "n8n",
        evento: "absence-alert",
        payload: body,
      },
    });

    const jugadores = await db.jugador.findMany({
      where: { equipo: { clubId }, activo: true },
      include: {
        usuario: { select: { email: true } },
        tutor: { select: { email: true, telefono: true } },
        asistencias: {
          where: { estado: "NO_ASISTIO" },
        },
        equipo: { select: { nombre: true } },
      },
    });

    const alertas = jugadores
      .filter((j: any) => j.asistencias.length >= umbralInasistencias)
      .map((j: any) => ({
        jugadorId: j.id,
        nombre: j.nombre,
        equipo: j.equipo.nombre,
        inasistencias: j.asistencias.length,
        contactoTutor: j.tutor,
      }));

    return NextResponse.json({ success: true, alertas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

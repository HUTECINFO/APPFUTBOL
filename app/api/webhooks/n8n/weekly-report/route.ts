import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasValidAutomationSecret } from "@/lib/webhooks";

export async function POST(req: Request) {
  if (!hasValidAutomationSecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { clubId } = body;

    await db.webhookLog.create({
      data: {
        proveedor: "n8n",
        evento: "weekly-report",
        payload: body,
      },
    });

    const ahora = new Date();
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    const asistencias = await db.asistencia.count({
      where: {
        evento: { equipo: { clubId } },
        estado: "ASISTIO",
        createdAt: { gte: hace7Dias },
      },
    });

    const pagos = await db.mensualidad.count({
      where: {
        jugador: { equipo: { clubId } },
        estado: "PAGADO",
        fechaPago: { gte: hace7Dias },
      },
    });

    const proximosEventos = await db.evento.findMany({
      where: { equipo: { clubId }, fecha: { gte: ahora } },
      orderBy: { fecha: "asc" },
      take: 5,
      include: { equipo: { select: { nombre: true } } },
    });

    return NextResponse.json({
      success: true,
      periodo: { desde: hace7Dias, hasta: ahora },
      asistencias,
      pagos,
      proximosEventos,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

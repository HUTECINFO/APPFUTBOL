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
        evento: "payment-reminder",
        payload: body,
      },
    });

    // Obtener mensualidades pendientes/vencidas del club
    const mensualidades = await db.mensualidad.findMany({
      where: {
        jugador: { equipo: { clubId } },
        estado: { in: ["PENDIENTE", "VENCIDO"] },
      },
      include: {
        jugador: {
          include: {
            tutor: { select: { nombre: true, email: true, telefono: true } },
            equipo: { select: { nombre: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      mensualidades: mensualidades.map((m: any) => ({
        id: m.id,
        jugador: m.jugador.nombre,
        tutor: m.jugador.tutor,
        periodo: m.periodo,
        monto: m.monto,
        estado: m.estado,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

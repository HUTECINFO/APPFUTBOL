import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasValidAutomationSecret } from "@/lib/webhooks";
import { datosComunicacionEvento, type EventCommunicationStage } from "@/lib/evento-comunicaciones";
import { EVENTO_TOUR } from "@/lib/evento-tour";

const stageDays: Record<Exclude<EventCommunicationStage, "CONFIRMACION">, number> = {
  "30_DIAS": 30,
  "14_DIAS": 14,
  "7_DIAS": 7,
  "48_HORAS": 2,
  AGRADECIMIENTO: -1,
};

export async function POST(req: Request) {
  if (!hasValidAutomationSecret(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const stage = body.stage as Exclude<EventCommunicationStage, "CONFIRMACION">;
    if (!(stage in stageDays)) return NextResponse.json({ error: "Etapa inválida" }, { status: 400 });

    const club = await db.club.findUnique({ where: { slug: EVENTO_TOUR.clubSlug }, select: { id: true } });
    if (!club) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    const solicitudes = await db.solicitudInscripcion.findMany({
      where: { clubId: club.id, estado: "APROBADA" },
      include: { equipo: { select: { nombre: true } } },
    });
    const now = new Date();
    const recipients = solicitudes.filter((solicitud: any) => {
      const dates = EVENTO_TOUR.sedes[solicitud.equipo?.nombre as keyof typeof EVENTO_TOUR.sedes];
      if (!dates) return false;
      const target = new Date(`${stage === "AGRADECIMIENTO" ? dates.fechaFin : dates.fechaInicio}T12:00:00-05:00`);
      const days = Math.round((target.getTime() - now.getTime()) / 86_400_000);
      return days === stageDays[stage];
    }).map((solicitud: any) => datosComunicacionEvento(solicitud, stage));

    await db.webhookLog.create({ data: { proveedor: "n8n", evento: `event-reminders:${stage}`, payload: { count: recipients.length } } });
    return NextResponse.json({ success: true, stage, recipients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "No se pudo preparar la comunicación" }, { status: 500 });
  }
}

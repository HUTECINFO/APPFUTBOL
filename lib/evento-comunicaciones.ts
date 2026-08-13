import { EVENTO_TOUR } from "@/lib/evento-tour";

export type EventCommunicationStage = "CONFIRMACION" | "30_DIAS" | "14_DIAS" | "7_DIAS" | "48_HORAS" | "AGRADECIMIENTO";

export function datosComunicacionEvento(solicitud: any, stage: EventCommunicationStage) {
  const sede = solicitud.equipo?.nombre || "Sede por confirmar";
  const fechas = EVENTO_TOUR.sedes[sede as keyof typeof EVENTO_TOUR.sedes];
  return {
    stage,
    subject: stage === "CONFIRMACION" ? "Registration Confirmed – USA Goalkeeper Tour 2026" : `${EVENTO_TOUR.nombre} – ${stage.replaceAll("_", " ")}`,
    evento: EVENTO_TOUR.nombre,
    jugador: solicitud.nombreJugador,
    tutor: solicitud.nombreTutor,
    email: solicitud.emailTutor,
    telefono: solicitud.telefonoTutor,
    ciudad: sede,
    fechaInicio: fechas?.fechaInicio,
    fechaFin: fechas?.fechaFin,
    montoPagado: Number(solicitud.montoPagado ?? EVENTO_TOUR.precioUsd),
    numeroConfirmacion: solicitud.numeroConfirmacion,
    grupo: solicitud.grupoAsignado,
    direccion: process.env.GOALKEEPER_TOUR_VENUE_ADDRESS || "Sede por confirmar",
    horaLlegada: process.env.GOALKEEPER_TOUR_ARRIVAL_TIME || "30 minutos antes del inicio",
    materiales: ["Guantes", "Ropa de entrenamiento", "Tachones", "Botella de agua", "Protector solar"],
    telefonoContacto: process.env.GOALKEEPER_TOUR_CONTACT_PHONE || "Por confirmar",
    canalComunicacion: process.env.GOALKEEPER_TOUR_COMMUNITY_URL || "",
  };
}

export async function enviarConfirmacionEvento(solicitud: any) {
  const url = process.env.N8N_EVENT_CONFIRMATION_WEBHOOK_URL;
  if (!url) return { sent: false, reason: "not_configured" };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosComunicacionEvento(solicitud, "CONFIRMACION")),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`El webhook de confirmación respondió ${response.status}`);
  return { sent: true };
}

export const WAIVER_VERSION = "2026-08-12-tour-v1";

export const WAIVER_TEXT =
  "Declaro que la información proporcionada es correcta y que tengo autoridad legal para inscribir al participante. " +
  "La firma electrónica y las aceptaciones quedan registradas con fecha, versión del documento y cuenta del tutor.";

export const TOUR_AUTHORIZATIONS = {
  waiverResponsabilidad: {
    title: "Exención de responsabilidad deportiva",
    text: "Reconozco los riesgos inherentes al entrenamiento de fútbol y autorizo la participación voluntaria del jugador.",
  },
  autorizacionMedica: {
    title: "Atención médica de emergencia",
    text: "Autorizo al personal a solicitar atención médica de emergencia cuando no sea posible localizarme oportunamente.",
  },
  autorizacionImagen: {
    title: "Fotografía y video",
    text: "Autorizo el uso de fotografías y video del participante con fines informativos y promocionales del evento.",
  },
  politicaCancelacion: {
    title: "Política de cancelación y reembolso",
    text: "Confirmo que leí y acepto la política de cancelación y reembolso comunicada por la organización.",
  },
  codigoConducta: {
    title: "Código de conducta",
    text: "Acepto que el participante y sus acompañantes respetarán al staff, instalaciones y demás participantes.",
  },
} as const;

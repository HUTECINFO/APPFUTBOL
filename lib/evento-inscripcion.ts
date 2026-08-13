import { db } from "@/lib/db";
import { EVENTO_TOUR } from "@/lib/evento-tour";

export interface ResultadoPagoEvento {
  solicitudId: string;
  jugadorId: string;
  tutorId: string;
  tutorEmail: string;
  tutorNecesitaClave: boolean;
  yaConfirmado: boolean;
}

/**
 * Confirma el pago de una solicitud del evento de forma idempotente:
 * aprueba la solicitud, crea (o reutiliza) la cuenta del tutor,
 * registra al portero y deja constancia del pago.
 */
export async function confirmarPagoEvento(params: {
  solicitudId: string;
  metodoPago: string;
  referenciaPago: string;
}): Promise<ResultadoPagoEvento> {
  const { solicitudId, metodoPago, referenciaPago } = params;

  const solicitud = await db.solicitudInscripcion.findFirst({
    where: { id: solicitudId, club: { slug: EVENTO_TOUR.clubSlug } },
    include: { equipo: { select: { id: true, nombre: true } } },
  });

  if (!solicitud) throw new Error("Solicitud no encontrada");
  if (!solicitud.equipoId || !solicitud.equipo) {
    throw new Error("La solicitud no tiene sede asignada");
  }
  if (solicitud.estado === "RECHAZADA") {
    throw new Error("La solicitud fue rechazada");
  }

  const pagoExistente = await db.pago.findFirst({
    where: { proveedorId: referenciaPago },
    select: { id: true },
  });

  if (solicitud.jugadorCreadoId) {
    const tutor = await db.usuario.findUnique({
      where: { email: solicitud.emailTutor },
      select: { id: true, email: true, password: true },
    });
    return {
      solicitudId: solicitud.id,
      jugadorId: solicitud.jugadorCreadoId,
      tutorId: tutor?.id || "",
      tutorEmail: solicitud.emailTutor,
      tutorNecesitaClave: !tutor?.password,
      yaConfirmado: true,
    };
  }

  const periodo = `${EVENTO_TOUR.nombre} · ${solicitud.equipo.nombre}`;

  const result = await db.$transaction(async (tx: any) => {
    const tutor = await tx.usuario.upsert({
      where: { email: solicitud.emailTutor },
      update: { telefono: solicitud.telefonoTutor || undefined },
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
        posicion: EVENTO_TOUR.posicionFija,
        fechaNacimiento: solicitud.fechaNacimiento,
        equipoId: solicitud.equipoId!,
        tutorId: tutor.id,
      },
    });

    const mensualidad = await tx.mensualidad.create({
      data: {
        jugadorId: jugador.id,
        periodo,
        monto: EVENTO_TOUR.precioUsd,
        estado: "PAGADO",
        fechaPago: new Date(),
        metodoPago,
        referenciaPago,
      },
    });

    if (!pagoExistente) {
      await tx.pago.create({
        data: {
          mensualidadId: mensualidad.id,
          monto: EVENTO_TOUR.precioUsd,
          metodoPago,
          proveedor: metodoPago.toLowerCase().includes("stripe") ? "stripe" : "prueba",
          proveedorId: referenciaPago,
        },
      });
    }

    await tx.solicitudInscripcion.update({
      where: { id: solicitud.id },
      data: { estado: "APROBADA", jugadorCreadoId: jugador.id, revisadoEn: new Date() },
    });

    return { jugador, tutor };
  });

  return {
    solicitudId: solicitud.id,
    jugadorId: result.jugador.id,
    tutorId: result.tutor.id,
    tutorEmail: solicitud.emailTutor,
    tutorNecesitaClave: !result.tutor.password,
    yaConfirmado: false,
  };
}

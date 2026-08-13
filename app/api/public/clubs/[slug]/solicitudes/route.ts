import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { WAIVER_VERSION } from "@/lib/waiver";
import { esClubEvento } from "@/lib/evento-tour";

const schema = z.object({
  equipoId: z.string().optional(),
  nombreJugador: z.string().min(2).max(150),
  fechaNacimiento: z.union([z.string().datetime(), z.string().date()]),
  categoriaNacimiento: z.string().max(50).optional(),
  clubActual: z.string().max(150).optional(),
  anosPortero: z.number().int().min(0).max(30).optional(),
  nivel: z.enum(["PRINCIPIANTE", "INTERMEDIO", "AVANZADO"]).optional(),
  tallaJersey: z.string().max(10).optional(),
  tallaGuantes: z.string().max(10).optional(),
  ciudadResidencia: z.string().max(150).optional(),
  lesionesCondiciones: z.string().max(1500).optional(),
  posicion: z.enum(["Portero", "Defensa", "Mediocampista", "Delantero"]).optional(),
  nombreTutor: z.string().min(2).max(150),
  emailTutor: z.string().email(),
  telefonoTutor: z.string().min(7).max(20).optional(),
  parentesco: z.string().max(50).optional(),
  direccionTutor: z.string().max(500).optional(),
  contactoEmergenciaNombre: z.string().max(150).optional(),
  contactoEmergenciaTelefono: z.string().max(30).optional(),
  contactoEmergenciaRelacion: z.string().max(80).optional(),
  seguroMedicoConfirmado: z.boolean().optional(),
  seguroMedicoProveedor: z.string().max(150).optional(),
  waiverResponsabilidad: z.boolean().optional(),
  autorizacionMedica: z.boolean().optional(),
  autorizacionImagen: z.boolean().optional(),
  politicaCancelacion: z.boolean().optional(),
  codigoConducta: z.boolean().optional(),
  firmaTutor: z.string().max(150).optional(),
  waiverAceptado: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar el consentimiento para continuar" }),
  }),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const club = await db.club.findUnique({
      where: { slug: params.slug },
      select: { id: true, activo: true },
    });

    if (!club || !club.activo) {
      return NextResponse.json({ error: "Club no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const data = schema.parse(body);
    const evento = esClubEvento(params.slug);

    if (evento && !data.equipoId) {
      return NextResponse.json({ error: "Selecciona la sede del tour para continuar" }, { status: 400 });
    }
    if (evento) {
      const camposObligatorios = [
        data.categoriaNacimiento, data.clubActual, data.nivel, data.tallaJersey, data.tallaGuantes,
        data.ciudadResidencia, data.telefonoTutor, data.parentesco, data.direccionTutor, data.contactoEmergenciaNombre,
        data.contactoEmergenciaTelefono, data.contactoEmergenciaRelacion, data.seguroMedicoProveedor,
        data.firmaTutor,
      ];
      const autorizaciones = [data.waiverResponsabilidad, data.autorizacionMedica, data.autorizacionImagen, data.politicaCancelacion, data.codigoConducta, data.seguroMedicoConfirmado];
      if (camposObligatorios.some((value) => !String(value || "").trim()) || data.anosPortero === undefined || autorizaciones.some((value) => value !== true)) {
        return NextResponse.json({ error: "Completa el expediente y todas las autorizaciones del evento" }, { status: 400 });
      }
      if (data.firmaTutor?.trim().toLocaleLowerCase() !== data.nombreTutor.trim().toLocaleLowerCase()) {
        return NextResponse.json({ error: "La firma electrónica debe coincidir con el nombre del tutor" }, { status: 400 });
      }
    }

    let equipoId: string | null = null;
    let estado: "PENDIENTE" | "LISTA_ESPERA" = "PENDIENTE";

    if (data.equipoId) {
      const equipo = await db.equipo.findFirst({
        where: { id: data.equipoId, clubId: club.id, activo: true },
        select: { id: true, cupoMaximo: true, _count: { select: { jugadores: true } } },
      });

      if (!equipo) {
        return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
      }

      equipoId = equipo.id;
      if (equipo.cupoMaximo !== null && equipo._count.jugadores >= equipo.cupoMaximo) {
        estado = "LISTA_ESPERA";
      }
    }

    const solicitud = await db.solicitudInscripcion.create({
      data: {
        clubId: club.id,
        equipoId,
        nombreJugador: data.nombreJugador,
        fechaNacimiento: new Date(data.fechaNacimiento),
        categoriaNacimiento: data.categoriaNacimiento,
        clubActual: data.clubActual,
        anosPortero: data.anosPortero,
        nivel: data.nivel,
        tallaJersey: data.tallaJersey,
        tallaGuantes: data.tallaGuantes,
        ciudadResidencia: data.ciudadResidencia,
        lesionesCondiciones: data.lesionesCondiciones,
        posicion: data.posicion,
        nombreTutor: data.nombreTutor,
        emailTutor: data.emailTutor.toLowerCase(),
        telefonoTutor: data.telefonoTutor,
        parentesco: data.parentesco,
        direccionTutor: data.direccionTutor,
        contactoEmergenciaNombre: data.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: data.contactoEmergenciaTelefono,
        contactoEmergenciaRelacion: data.contactoEmergenciaRelacion,
        seguroMedicoConfirmado: data.seguroMedicoConfirmado ?? false,
        seguroMedicoProveedor: data.seguroMedicoProveedor,
        waiverResponsabilidad: data.waiverResponsabilidad ?? false,
        autorizacionMedica: data.autorizacionMedica ?? false,
        autorizacionImagen: data.autorizacionImagen ?? false,
        politicaCancelacion: data.politicaCancelacion ?? false,
        codigoConducta: data.codigoConducta ?? false,
        firmaTutor: data.firmaTutor,
        firmadoEn: evento ? new Date() : undefined,
        waiverAceptado: true,
        waiverVersion: WAIVER_VERSION,
        waiverAceptadoEn: new Date(),
        estado,
      },
    });

    return NextResponse.json(
      { id: solicitud.id, estado: solicitud.estado },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Error al enviar la solicitud" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { WAIVER_VERSION } from "@/lib/waiver";

const schema = z.object({
  equipoId: z.string().optional(),
  nombreJugador: z.string().min(2).max(150),
  fechaNacimiento: z.union([z.string().datetime(), z.string().date()]),
  posicion: z.enum(["Portero", "Defensa", "Mediocampista", "Delantero"]).optional(),
  nombreTutor: z.string().min(2).max(150),
  emailTutor: z.string().email(),
  telefonoTutor: z.string().min(7).max(20).optional(),
  parentesco: z.string().max(50).optional(),
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
        posicion: data.posicion,
        nombreTutor: data.nombreTutor,
        emailTutor: data.emailTutor.toLowerCase(),
        telefonoTutor: data.telefonoTutor,
        parentesco: data.parentesco,
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

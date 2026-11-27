import { db } from "@/lib/db";

export type EstadisticasAlumno = {
  partidosJugados: number;
  torneos: number;
  goles: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
};

/**
 * Equipos del club con sus alumnos activos, el perfil deportivo capturado y
 * las estadísticas que la plataforma ya registra (goles, tarjetas, asistencia
 * a partidos y torneos) para precargar los datos de competición.
 */
export async function cargarRubricaClub(clubId: string, filtro: { entrenadorId?: string; equipoId?: string; jugadorId?: string } = {}) {
  const equipos: any[] = await db.equipo.findMany({
    where: {
      clubId,
      ...(filtro.entrenadorId ? { entrenadorId: filtro.entrenadorId } : {}),
      ...(filtro.equipoId ? { id: filtro.equipoId } : {}),
    },
    orderBy: { nombre: "asc" },
    include: {
      jugadores: {
        where: { activo: true, ...(filtro.jugadorId ? { id: filtro.jugadorId } : {}) },
        orderBy: { nombre: "asc" },
        include: {
          perfilesDeportivos: true,
          goles: { select: { id: true } },
          tarjetas: { select: { id: true, color: true } },
          asistencias: { where: { estado: "ASISTIO" }, include: { evento: { select: { tipo: true } } } },
        },
      },
    },
  });

  return equipos.map((equipo) => ({
    id: equipo.id as string,
    nombre: equipo.nombre as string,
    categoria: equipo.categoria as string,
    jugadores: ((equipo.jugadores ?? []) as any[]).map((j) => {
      const estadisticas: EstadisticasAlumno = {
        partidosJugados: j.asistencias.filter((a: any) => a.evento?.tipo === "PARTIDO").length,
        torneos: j.asistencias.filter((a: any) => a.evento?.tipo === "TORNEO").length,
        goles: j.goles.length,
        tarjetasAmarillas: j.tarjetas.filter((t: any) => t.color === "amarilla").length,
        tarjetasRojas: j.tarjetas.filter((t: any) => t.color === "roja").length,
      };
      return {
        id: j.id as string,
        nombre: j.nombre as string,
        posicion: j.posicion as string,
        dorsal: (j.dorsal ?? null) as number | null,
        fotoUrl: (j.fotoUrl ?? null) as string | null,
        fechaNacimiento: j.fechaNacimiento as Date,
        perfil: (j.perfilesDeportivos?.[0] ?? null) as Record<string, any> | null,
        estadisticas,
      };
    }),
  }));
}

export type RubricaEquipo = Awaited<ReturnType<typeof cargarRubricaClub>>[number];
export type RubricaAlumno = RubricaEquipo["jugadores"][number];

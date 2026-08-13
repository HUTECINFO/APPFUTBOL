import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esClubEvento, EVENTO_TOUR } from "@/lib/evento-tour";
import { EventoDashboardView } from "@/components/club/evento-dashboard-view";
import { toClientData } from "@/lib/serialize";

export default async function EventoDashboardPage({
  params,
}: {
  params: { clubId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isAdmin = ["SUPER_ADMIN", "CLUB_ADMIN"].includes(session.user.role);
  if (!isAdmin) redirect("/unauthorized");

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    select: { id: true, nombre: true, slug: true },
  });

  if (!club) redirect("/unauthorized");

  const solicitudes = await db.solicitudInscripcion.findMany({
    where: { clubId: params.clubId },
    orderBy: { createdAt: "desc" },
    include: {
      equipo: { select: { id: true, nombre: true, categoria: true } },
    },
  });

  const equipos = await db.equipo.findMany({
    where: { clubId: params.clubId, activo: true },
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      categoria: true,
      cupoMaximo: true,
      _count: { select: { jugadores: true } },
    },
  });

  const mensualidadesPagadas = await db.mensualidad.findMany({
    where: {
      estado: "PAGADO",
      jugador: { equipo: { clubId: params.clubId } },
    },
    select: { monto: true, metodoPago: true, fechaPago: true },
  });

  const ingresosUsd = mensualidadesPagadas.reduce((acc: number, m: any) => acc + Number(m.monto), 0);
  const pagados = solicitudes.filter((s: any) => s.estado === "APROBADA").length;
  const pendientesPago = solicitudes.filter((s: any) => s.estado === "PENDIENTE" || s.estado === "LISTA_ESPERA").length;
  const cupoTotal = equipos.reduce((acc: number, e: any) => acc + (e.cupoMaximo ?? 0), 0);
  const inscritos = equipos.reduce((acc: number, e: any) => acc + e._count.jugadores, 0);

  const porSede = equipos.map((equipo: any) => {
    const deSede = solicitudes.filter((s: any) => s.equipoId === equipo.id);
    const pagadosSede = deSede.filter((s: any) => s.estado === "APROBADA").length;
    return {
      id: equipo.id,
      nombre: equipo.nombre,
      categoria: equipo.categoria,
      cupo: equipo.cupoMaximo ?? EVENTO_TOUR.cupoPorSede,
      inscritos: equipo._count.jugadores,
      pagados: pagadosSede,
      pendientes: deSede.length - pagadosSede,
      ingresosUsd: pagadosSede * EVENTO_TOUR.precioUsd,
    };
  });

  return (
    <EventoDashboardView
      esEvento={esClubEvento(club.slug)}
      clubNombre={club.nombre}
      kpis={{
        ingresosUsd,
        pagados,
        pendientesPago,
        cupoTotal,
        inscritos,
        precioUsd: EVENTO_TOUR.precioUsd,
      }}
      sedes={porSede}
      solicitudes={toClientData(solicitudes)}
    />
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RegistroView } from "@/components/club/registro-view";
import { toClientData } from "@/lib/serialize";
import { actorFromSession, canManageClub } from "@/lib/authorization";

export default async function RegistroPage(
  props: {
    params: Promise<{ clubId: string }>;
  }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (!(await canManageClub(actorFromSession(session), params.clubId))) redirect("/unauthorized");

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    select: {
      id: true,
      nombre: true,
      slug: true,
      equipos: {
        where: { activo: true },
        orderBy: { nombre: "asc" },
        select: {
          id: true,
          nombre: true,
          categoria: true,
          cupoMaximo: true,
          _count: { select: { jugadores: true } },
        },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  const solicitudes = await db.solicitudInscripcion.findMany({
    where: { clubId: params.clubId },
    orderBy: { createdAt: "desc" },
    include: {
      equipo: { select: { id: true, nombre: true, categoria: true } },
      revisadoPor: { select: { id: true, nombre: true } },
    },
  });

  return <RegistroView club={toClientData(club)} solicitudes={toClientData(solicitudes)} />;
}

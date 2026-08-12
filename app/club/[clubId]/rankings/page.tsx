import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RankingsView } from "@/components/club/rankings-view";
import { toClientData } from "@/lib/serialize";

export default async function RankingsPage({
  params,
}: {
  params: { clubId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    include: {
      equipos: {
        where: session.user.role === "ENTRENADOR" ? { entrenadorId: session.user.id } : undefined,
        include: {
          jugadores: {
            where: { activo: true },
            include: {
              equipo: {
                select: { id: true, nombre: true },
              },
              _count: {
                select: {
                  asistencias: {
                    where: { estado: "ASISTIO" },
                  },
                  goles: true,
                  tarjetas: true,
                },
              },
              asistencias: {
                where: { estado: "ASISTIO" },
                select: { id: true },
              },
              goles: { select: { id: true } },
              tarjetas: { select: { id: true, color: true } },
            },
          },
        },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  return <RankingsView club={toClientData(club)} />;
}

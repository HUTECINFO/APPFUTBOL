import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ConfiguracionView } from "@/components/club/configuracion-view";
import { toClientData } from "@/lib/serialize";
import { actorFromSession, canManageClub } from "@/lib/authorization";

export default async function ConfiguracionPage(
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
    include: {
      admins: { select: { id: true, nombre: true, email: true } },
      _count: {
        select: { equipos: true, sedes: true },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  return <ConfiguracionView club={toClientData(club)} role={session.user.role} />;
}

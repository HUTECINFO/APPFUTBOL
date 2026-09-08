import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BackgroundChecksView } from "@/components/club/background-checks-view";
import { toClientData } from "@/lib/serialize";
import { actorFromSession, canManageClub } from "@/lib/authorization";

export default async function BackgroundChecksPage(
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
      equipos: {
        include: {
          entrenador: { select: { id: true, nombre: true, email: true } },
        },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  const checks = await db.backgroundCheck.findMany({
    where: { clubId: params.clubId },
    orderBy: { createdAt: "desc" },
    include: {
      usuario: { select: { id: true, nombre: true, email: true, rol: true } },
    },
  });

  return (
    <BackgroundChecksView
      club={toClientData(club)}
      checks={toClientData(checks)}
      role={session.user.role}
    />
  );
}

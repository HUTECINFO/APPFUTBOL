import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BackgroundChecksView } from "@/components/club/background-checks-view";
import { toClientData } from "@/lib/serialize";

export default async function BackgroundChecksPage({
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

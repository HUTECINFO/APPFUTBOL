import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ClubIndexPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const club = await db.club.findFirst({
    where: {
      OR: [
        { admins: { some: { id: session.user.id } } },
        { equipos: { some: { entrenadorId: session.user.id } } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (!club) redirect("/unauthorized");
  redirect(`/club/${club.id}/dashboard`);
}

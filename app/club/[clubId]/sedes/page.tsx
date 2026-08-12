import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { SedesView } from "@/components/club/sedes-view";
import { toClientData } from "@/lib/serialize";

export default async function SedesPage({
  params,
}: {
  params: { clubId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const club = await db.club.findUnique({
    where: { id: params.clubId },
    include: {
      sedes: {
        orderBy: { nombre: "asc" },
      },
    },
  });

  if (!club) redirect("/unauthorized");

  return (
    <SedesView 
      club={toClientData(club)} 
      role={session.user.role}
    />
  );
}

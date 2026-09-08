import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PizarraTactica } from "@/components/tactica/pizarra-tactica";
import { actorFromSession, canAccessTeam } from "@/lib/authorization";

export default async function TacticaPage(
  props: {
    params: Promise<{ clubId: string; equipoId: string }>;
  }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!(await canAccessTeam(actorFromSession(session), params.clubId, params.equipoId))) redirect("/unauthorized");

  const equipo = await db.equipo.findFirst({
    where: {
      id: params.equipoId,
      clubId: params.clubId,
      ...(session.user.role === "ENTRENADOR" ? { entrenadorId: session.user.id } : {}),
    },
    include: {
      jugadores: {
        where: { activo: true },
        orderBy: { dorsal: "asc" },
      },
      formaciones: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!equipo) redirect("/unauthorized");

  return (
    <PizarraTactica
      equipo={equipo}
      clubId={params.clubId}
      role={session.user.role}
    />
  );
}

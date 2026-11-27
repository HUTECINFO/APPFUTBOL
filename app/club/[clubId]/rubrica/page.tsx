import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RubricaView } from "@/components/club/rubrica-view";
import { toClientData } from "@/lib/serialize";
import { actorFromSession, canAccessClub, canManageClub } from "@/lib/authorization";
import { cargarRubricaClub } from "@/lib/rubrica-server";

export default async function RubricaPage(props: { params: Promise<{ clubId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const actor = actorFromSession(session);
  if (!(await canAccessClub(actor, params.clubId))) redirect("/unauthorized");

  const club = await db.club.findUnique({ where: { id: params.clubId }, select: { id: true, nombre: true, esColegio: true } });
  if (!club) redirect("/unauthorized");
  if (!club.esColegio) redirect(`/club/${params.clubId}/dashboard`);

  const esAdmin = await canManageClub(actor, params.clubId);
  const equipos = await cargarRubricaClub(params.clubId, { entrenadorId: esAdmin ? undefined : actor.userId });

  return <RubricaView club={{ id: club.id, nombre: club.nombre }} equipos={toClientData(equipos)} />;
}

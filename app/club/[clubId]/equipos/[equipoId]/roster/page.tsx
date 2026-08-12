import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RosterView } from "@/components/club/roster-view";

export default async function RosterPage({
  params,
}: {
  params: { clubId: string; equipoId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const equipo = await db.equipo.findFirst({
    where: {
      id: params.equipoId,
      clubId: params.clubId,
      ...(session.user.role === "ENTRENADOR" ? { entrenadorId: session.user.id } : {}),
    },
    include: {
      jugadores: {
        orderBy: { dorsal: "asc" },
        select: {
          id: true, nombre: true, apodo: true, fotoUrl: true, posicion: true, dorsal: true,
          fechaNacimiento: true, activo: true, idQrCode: true, createdAt: true, updatedAt: true,
          contactoEmergenciaNombre: true, contactoEmergenciaTelefono: true, alergias: true,
          tipoSangre: true, seguroMedicoProveedor: true, seguroMedicoPoliza: true, documentos: true,
          tutor: { select: { id: true, nombre: true, email: true, telefono: true } },
        },
      },
      entrenador: { select: { id: true, nombre: true } },
    },
  });

  if (!equipo) redirect("/unauthorized");

  const tutores = await db.usuario.findMany({
    where: {
      rol: "TUTOR",
      activo: true,
      tutorDe: { some: { equipo: { clubId: params.clubId } } },
    },
    select: { id: true, nombre: true, email: true, telefono: true },
  });

  return (
    <RosterView
      equipo={equipo}
      tutores={tutores}
      role={session.user.role}
      clubId={params.clubId}
    />
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppPerfilView } from "@/components/app/app-perfil-view";

export default async function AppPerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const usuario = await db.usuario.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      rol: true,
      image: true,
    },
  });

  if (!usuario) redirect("/login");

  const jugadores = await db.jugador.findMany({
    where: {
      OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }],
    },
    include: {
      equipo: {
        select: {
          id: true,
          nombre: true,
          club: { select: { id: true, nombre: true } },
        },
      },
    },
  });

  return <AppPerfilView usuario={usuario} jugadores={jugadores} />;
}

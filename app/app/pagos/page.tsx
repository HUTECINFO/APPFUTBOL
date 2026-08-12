import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppPagosView } from "@/components/app/app-pagos-view";
import { toClientData } from "@/lib/serialize";

export default async function AppPagosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const mensualidades = await db.mensualidad.findMany({
    where: {
      jugador: {
        OR: [{ usuarioId: session.user.id }, { tutorId: session.user.id }],
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      jugador: {
        include: {
          equipo: {
            select: {
              id: true,
              nombre: true,
              club: { select: { id: true, nombre: true } },
            },
          },
        },
      },
    },
  });

  return (
    <AppPagosView
      mensualidades={toClientData(mensualidades)}
      stripeEnabled={Boolean(process.env.STRIPE_SECRET_KEY)}
    />
  );
}

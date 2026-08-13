import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClubSidebar } from "@/components/layout/club-sidebar";
import { ClubHeader } from "@/components/layout/club-header";
import { brandCssVariables } from "@/lib/theme";
import { esClubEvento } from "@/lib/evento-tour";

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clubId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const role = session.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isClubAdmin = role === "CLUB_ADMIN";
  const isCoach = role === "ENTRENADOR";

  if (!isSuperAdmin && !isClubAdmin && !isCoach) redirect("/unauthorized");

  let club = null;

  if (params.clubId) {
    club = await db.club.findFirst({
      where: {
        id: params.clubId,
        ...(isSuperAdmin
          ? {}
          : isClubAdmin
            ? { admins: { some: { id: session.user.id } } }
            : { equipos: { some: { entrenadorId: session.user.id } } }),
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        logoUrl: true,
        colorPrimario: true,
        colorSecundario: true,
      },
    });
  } else if (isClubAdmin || isCoach) {
    club = await db.club.findFirst({
      where: {
        OR: [
          { admins: { some: { id: session.user.id } } },
          { equipos: { some: { entrenadorId: session.user.id } } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        logoUrl: true,
        colorPrimario: true,
        colorSecundario: true,
      },
    });
  }

  if (!club && params.clubId) redirect("/unauthorized");

  const themeVars = brandCssVariables({
    colorPrimario: club?.colorPrimario,
    colorSecundario: club?.colorSecundario,
  });

  return (
    <div className="relative flex min-h-screen overflow-x-clip" style={themeVars}>
      <div aria-hidden="true" className="club-ambient-orb club-ambient-orb--one" />
      <div aria-hidden="true" className="club-ambient-orb club-ambient-orb--two" />
      {club && <ClubSidebar clubNombre={club.nombre} role={role} esEvento={esClubEvento(club.slug)} />}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        <ClubHeader />
        <main id="contenido-principal" className="page-enter flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

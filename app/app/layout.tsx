import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { BottomNav } from "@/components/app/bottom-nav";
import { AppThemeProvider } from "@/components/theme/app-theme-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const allowed = ["JUGADOR", "TUTOR", "ENTRENADOR", "CLUB_ADMIN", "SUPER_ADMIN"];
  if (!allowed.includes(session.user.role)) redirect("/unauthorized");

  return (
    <AppThemeProvider>
      <div className="relative min-h-[100dvh] overflow-x-hidden bg-dark-900 text-foreground">
        <div aria-hidden className="club-ambient-orb club-ambient-orb--one" />
        <div aria-hidden className="club-ambient-orb club-ambient-orb--two" />
        <main id="contenido-principal" className="relative z-10 mx-auto max-w-md pb-32">
          {children}
        </main>
        <BottomNav />
      </div>
    </AppThemeProvider>
  );
}

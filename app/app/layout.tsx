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
      <div className="min-h-screen bg-dark-900 text-foreground">
        <main id="contenido-principal" className="pb-20">{children}</main>
        <BottomNav />
      </div>
    </AppThemeProvider>
  );
}

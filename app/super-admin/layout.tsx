import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-gradient">Club One</h1>
          <p className="text-sm text-white/50">Super Admin</p>
        </div>
      </header>
      <main id="contenido-principal" className="max-w-7xl mx-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}

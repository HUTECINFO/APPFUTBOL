import { ActivarCuentaForm } from "@/components/auth/activar-cuenta-form";
import { Card } from "@/components/ui/card";
import { verifyAccountActivationToken } from "@/lib/account-activation";

export default async function ActivarCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const activation = token ? verifyAccountActivationToken(token) : null;
  return (
    <main id="contenido-principal" className="flex min-h-screen items-center justify-center px-6">
      <Card className="glass-panel w-full max-w-md p-8">
        <ActivarCuentaForm token={token} email={activation?.email || ""} isReset={activation?.purpose === "reset"} />
      </Card>
    </main>
  );
}

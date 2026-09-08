import { ActivarCuentaForm } from "@/components/auth/activar-cuenta-form";
import { Card } from "@/components/ui/card";

export default async function ActivarCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <main id="contenido-principal" className="flex min-h-screen items-center justify-center px-6">
      <Card className="glass-panel w-full max-w-md p-8">
        <ActivarCuentaForm token={token} />
      </Card>
    </main>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="glass-panel p-8 text-center max-w-md">
        <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-2xl font-display font-bold mb-2">Acceso no autorizado</h1>
        <p className="text-white/60 mb-6">
          No tienes permisos para ver esta página. Contacta al administrador del club si crees que es un error.
        </p>
        <Link href="/">
          <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold">
            Volver al inicio
          </Button>
        </Link>
      </Card>
    </div>
  );
}

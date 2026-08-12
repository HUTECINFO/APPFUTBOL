"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-pitch-500/10 text-pitch-400 flex items-center justify-center text-5xl font-display font-bold border border-pitch-500/20">
          404
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Página no encontrada
        </h1>
        <p className="text-white/60 mb-8 text-lg">
          Parece que te perdiste en la cancha. La página que buscas no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" /> Ir al inicio
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => history.back()}
            className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
}

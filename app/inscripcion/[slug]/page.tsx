import { db } from "@/lib/db";
import { InscripcionForm } from "@/components/inscripcion/inscripcion-form";
import { toClientData } from "@/lib/serialize";

export default async function InscripcionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { sede?: string };
}) {
  const club = await db.club.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      nombre: true,
      slug: true,
      logoUrl: true,
      colorPrimario: true,
      colorSecundario: true,
      activo: true,
      equipos: {
        where: { activo: true },
        orderBy: { nombre: "asc" },
        select: {
          id: true,
          nombre: true,
          categoria: true,
          genero: true,
          cupoMaximo: true,
          _count: { select: { jugadores: true } },
        },
      },
    },
  });

  if (!club || !club.activo) {
    return (
      <div id="contenido-principal" className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-panel max-w-md w-full p-8 text-center rounded-2xl">
          <h1 className="text-2xl font-display font-bold mb-2">Club no disponible</h1>
          <p className="text-white/60">
            El link de inscripción no es válido o el club ya no está activo. Contacta a tu club para obtener el link correcto.
          </p>
        </div>
      </div>
    );
  }

  const tourSedes: Record<string, string> = {
    elPaso: "El Paso",
    dallasFortWorth: "Dallas–Fort Worth",
    houston: "Houston",
    sanAntonio: "San Antonio",
  };
  const selectedSede = tourSedes[searchParams?.sede || ""];
  const initialEquipoId = selectedSede
    ? club.equipos.find((equipo: { nombre: string }) => equipo.nombre === selectedSede)?.id
    : undefined;

  return <InscripcionForm club={toClientData(club)} initialEquipoId={initialEquipoId} />;
}

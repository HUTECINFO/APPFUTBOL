-- Colegios: clubes que evalúan a sus alumnos con una rúbrica deportiva
-- (perfil técnico-táctico, atributos 1-10 y datos de competición).
ALTER TABLE "clubs" ADD COLUMN IF NOT EXISTS "esColegio" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "perfiles_deportivos" (
    "id" TEXT NOT NULL,
    "jugadorId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "evaluadoPorId" TEXT,

    -- Ficha del alumno
    "matricula" TEXT,
    "categoriaCompetitiva" TEXT,
    "estatura" DECIMAL(4,2),
    "peso" DECIMAL(5,1),
    "pieDominante" TEXT,
    "rolPrincipal" TEXT,
    "rolSecundario" TEXT,

    -- Perfil técnico-táctico
    "perfilTecnicoTactico" TEXT,
    "fortalezas" TEXT,
    "areasOportunidad" TEXT,
    "objetivoIndividual" TEXT,
    "observacionesEntrenador" TEXT,

    -- Atributos (1 a 10)
    "gestoTecnico" DECIMAL(3,1),
    "participacionJuego" DECIMAL(3,1),
    "paseAcertado" DECIMAL(3,1),
    "velocidad" DECIMAL(3,1),
    "agilidad" DECIMAL(3,1),
    "resistencia" DECIMAL(3,1),
    "fuerza" DECIMAL(3,1),
    "aptitudDeportiva" DECIMAL(3,1),

    -- Datos de competición
    "partidosJugados" INTEGER,
    "partidosTitular" INTEGER,
    "partidosSuplente" INTEGER,
    "minutos" INTEGER,
    "participaciones" INTEGER,
    "actitudDeportiva" TEXT,
    "goles" INTEGER,
    "asistenciasGol" INTEGER,
    "torneos" INTEGER,
    "tarjetasAmarillas" INTEGER,
    "tarjetasRojas" INTEGER,
    "ligas" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "observacionesCompeticion" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfiles_deportivos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "perfiles_deportivos_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "jugadores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "perfiles_deportivos_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "perfiles_deportivos_evaluadoPorId_fkey" FOREIGN KEY ("evaluadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "perfiles_deportivos_jugadorId_key" ON "perfiles_deportivos"("jugadorId");
CREATE INDEX IF NOT EXISTS "perfiles_deportivos_clubId_idx" ON "perfiles_deportivos"("clubId");

ALTER TABLE "perfiles_deportivos" ENABLE ROW LEVEL SECURITY;

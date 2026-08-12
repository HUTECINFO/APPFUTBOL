-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'LISTA_ESPERA', 'APROBADA', 'RECHAZADA');

-- AlterTable
ALTER TABLE "equipos" ADD COLUMN     "cupoMaximo" INTEGER;

-- CreateTable
CREATE TABLE "solicitudes_inscripcion" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "equipoId" TEXT,
    "nombreJugador" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "posicion" TEXT,
    "nombreTutor" TEXT NOT NULL,
    "emailTutor" TEXT NOT NULL,
    "telefonoTutor" TEXT,
    "parentesco" TEXT,
    "waiverAceptado" BOOLEAN NOT NULL DEFAULT false,
    "waiverVersion" TEXT,
    "waiverAceptadoEn" TIMESTAMP(3),
    "descuentoPorcentaje" DECIMAL(5,2),
    "notasAdmin" TEXT,
    "motivoRechazo" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "jugadorCreadoId" TEXT,
    "revisadoPorId" TEXT,
    "revisadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_inscripcion_jugadorCreadoId_key" ON "solicitudes_inscripcion"("jugadorCreadoId");

-- AddForeignKey
ALTER TABLE "solicitudes_inscripcion" ADD CONSTRAINT "solicitudes_inscripcion_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_inscripcion" ADD CONSTRAINT "solicitudes_inscripcion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_inscripcion" ADD CONSTRAINT "solicitudes_inscripcion_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

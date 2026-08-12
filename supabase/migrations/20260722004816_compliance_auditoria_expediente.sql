-- CreateEnum
CREATE TYPE "BackgroundCheckState" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'EXPIRADO');

-- AlterTable
ALTER TABLE "jugadores" ADD COLUMN     "alergias" TEXT,
ADD COLUMN     "contactoEmergenciaNombre" TEXT,
ADD COLUMN     "contactoEmergenciaTelefono" TEXT,
ADD COLUMN     "documentos" JSONB,
ADD COLUMN     "seguroMedicoPoliza" TEXT,
ADD COLUMN     "seguroMedicoProveedor" TEXT,
ADD COLUMN     "tipoSangre" TEXT;

-- CreateTable
CREATE TABLE "background_checks" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estado" "BackgroundCheckState" NOT NULL DEFAULT 'PENDIENTE',
    "proveedor" TEXT,
    "referencia" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "expiraEn" TIMESTAMP(3),
    "notas" TEXT,
    "revisadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "clubId" TEXT,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRol" TEXT NOT NULL,
    "cambios" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_clubId_idx" ON "audit_logs"("clubId");

-- CreateIndex
CREATE INDEX "audit_logs_entidad_entidadId_idx" ON "audit_logs"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

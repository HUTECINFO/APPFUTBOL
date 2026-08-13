-- USA Goalkeeper Tour: expediente completo, autorizaciones, pago y check-in.
ALTER TABLE "solicitudes_inscripcion"
  ADD COLUMN IF NOT EXISTS "categoriaNacimiento" TEXT,
  ADD COLUMN IF NOT EXISTS "clubActual" TEXT,
  ADD COLUMN IF NOT EXISTS "anosPortero" INTEGER,
  ADD COLUMN IF NOT EXISTS "nivel" TEXT,
  ADD COLUMN IF NOT EXISTS "tallaJersey" TEXT,
  ADD COLUMN IF NOT EXISTS "tallaGuantes" TEXT,
  ADD COLUMN IF NOT EXISTS "ciudadResidencia" TEXT,
  ADD COLUMN IF NOT EXISTS "lesionesCondiciones" TEXT,
  ADD COLUMN IF NOT EXISTS "direccionTutor" TEXT,
  ADD COLUMN IF NOT EXISTS "contactoEmergenciaNombre" TEXT,
  ADD COLUMN IF NOT EXISTS "contactoEmergenciaTelefono" TEXT,
  ADD COLUMN IF NOT EXISTS "contactoEmergenciaRelacion" TEXT,
  ADD COLUMN IF NOT EXISTS "seguroMedicoConfirmado" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "seguroMedicoProveedor" TEXT,
  ADD COLUMN IF NOT EXISTS "waiverResponsabilidad" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "autorizacionMedica" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "autorizacionImagen" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "politicaCancelacion" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "codigoConducta" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "firmaTutor" TEXT,
  ADD COLUMN IF NOT EXISTS "firmadoEn" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cupoReservadoHasta" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "montoPagado" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "numeroConfirmacion" TEXT,
  ADD COLUMN IF NOT EXISTS "grupoAsignado" TEXT,
  ADD COLUMN IF NOT EXISTS "checkedInAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "kitEntregado" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "solicitudes_inscripcion_equipo_estado_idx"
  ON "solicitudes_inscripcion" ("equipoId", "estado");

CREATE UNIQUE INDEX IF NOT EXISTS "solicitudes_inscripcion_numeroConfirmacion_key"
  ON "solicitudes_inscripcion" ("numeroConfirmacion")
  WHERE "numeroConfirmacion" IS NOT NULL;

-- Reserva un lugar durante 31 minutos, ligeramente por encima de la sesión
-- de Stripe. El bloqueo del equipo serializa solicitudes concurrentes.
CREATE OR REPLACE FUNCTION reserve_tour_spot(p_solicitud_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_equipo_id TEXT;
  v_cupo INTEGER;
  v_ocupados INTEGER;
BEGIN
  SELECT s."equipoId"
    INTO v_equipo_id
    FROM "solicitudes_inscripcion" s
   WHERE s.id = p_solicitud_id
     AND s.estado IN ('PENDIENTE', 'LISTA_ESPERA')
   FOR UPDATE;

  IF v_equipo_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT e."cupoMaximo"
    INTO v_cupo
    FROM equipos e
   WHERE e.id = v_equipo_id
   FOR UPDATE;

  IF v_cupo IS NULL THEN
    UPDATE "solicitudes_inscripcion"
       SET "cupoReservadoHasta" = NOW() + INTERVAL '31 minutes',
           estado = 'PENDIENTE',
           "updatedAt" = NOW()
     WHERE id = p_solicitud_id;
    RETURN TRUE;
  END IF;

  SELECT COUNT(*)
    INTO v_ocupados
    FROM "solicitudes_inscripcion" s
   WHERE s."equipoId" = v_equipo_id
     AND s.id <> p_solicitud_id
     AND (
       s.estado = 'APROBADA'
       OR (s."cupoReservadoHasta" IS NOT NULL AND s."cupoReservadoHasta" > NOW())
     );

  IF v_ocupados >= v_cupo THEN
    UPDATE "solicitudes_inscripcion"
       SET estado = 'LISTA_ESPERA',
           "cupoReservadoHasta" = NULL,
           "updatedAt" = NOW()
     WHERE id = p_solicitud_id;
    RETURN FALSE;
  END IF;

  UPDATE "solicitudes_inscripcion"
     SET estado = 'PENDIENTE',
         "cupoReservadoHasta" = NOW() + INTERVAL '31 minutes',
         "updatedAt" = NOW()
   WHERE id = p_solicitud_id;
  RETURN TRUE;
END;
$$;


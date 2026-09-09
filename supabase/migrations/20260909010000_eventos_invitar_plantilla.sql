-- Los eventos que ya existían también deben aparecer como invitación para
-- toda su plantilla. Solo se agregan jugadores activos que aún no tienen
-- una respuesta para ese evento.
INSERT INTO "asistencias" (
  "id",
  "eventoId",
  "jugadorId",
  "estado",
  "createdAt",
  "updatedAt"
)
SELECT
  md5(evento."id" || jugador."id" || clock_timestamp()::text),
  evento."id",
  jugador."id",
  'PENDIENTE'::"EstadoAsistencia",
  NOW(),
  NOW()
FROM "eventos" AS evento
INNER JOIN "jugadores" AS jugador
  ON jugador."equipoId" = evento."equipoId"
LEFT JOIN "asistencias" AS asistencia
  ON asistencia."eventoId" = evento."id"
  AND asistencia."jugadorId" = jugador."id"
WHERE jugador."activo" = true
  AND asistencia."id" IS NULL;

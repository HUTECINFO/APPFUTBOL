-- Registra un pago y actualiza la mensualidad en una sola transacción.
CREATE UNIQUE INDEX IF NOT EXISTS "pagos_proveedor_referencia_key"
  ON "pagos" ("proveedor", "proveedorId")
  WHERE "proveedorId" IS NOT NULL;

CREATE OR REPLACE FUNCTION record_monthly_payment(
  p_mensualidad_id TEXT,
  p_metodo TEXT,
  p_proveedor TEXT,
  p_proveedor_id TEXT,
  p_actor_id TEXT DEFAULT NULL
)
RETURNS SETOF "mensualidades"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_monto DECIMAL(10,2);
BEGIN
  SELECT monto INTO v_monto
    FROM "mensualidades"
   WHERE id = p_mensualidad_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mensualidad no encontrada';
  END IF;

  INSERT INTO "pagos" (
    id, "mensualidadId", monto, "metodoPago", proveedor,
    "proveedorId", "procesadoPorId", "createdAt"
  ) VALUES (
    gen_random_uuid()::text, p_mensualidad_id, v_monto, p_metodo, p_proveedor,
    p_proveedor_id, p_actor_id, NOW()
  )
  ON CONFLICT (proveedor, "proveedorId") WHERE "proveedorId" IS NOT NULL
  DO NOTHING;

  RETURN QUERY
  UPDATE "mensualidades"
     SET estado = 'PAGADO',
         "fechaPago" = COALESCE("fechaPago", NOW()),
         "metodoPago" = p_metodo,
         "referenciaPago" = COALESCE(p_proveedor_id, "referenciaPago"),
         "updatedAt" = NOW()
   WHERE id = p_mensualidad_id
   RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION record_monthly_payment(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_monthly_payment(TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

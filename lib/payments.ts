import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function recordMonthlyPayment(params: {
  mensualidadId: string;
  metodoPago: string;
  proveedor: string;
  proveedorId: string;
  procesadoPorId?: string | null;
}) {
  const { data, error } = await supabaseAdmin.rpc("record_monthly_payment", {
    p_mensualidad_id: params.mensualidadId,
    p_metodo: params.metodoPago,
    p_proveedor: params.proveedor,
    p_proveedor_id: params.proveedorId,
    p_actor_id: params.procesadoPorId ?? null,
  });

  if (!error) return Array.isArray(data) ? data[0] : data;

  // Compatibilidad durante el primer despliegue, antes de aplicar la migración.
  if (error.code !== "PGRST202" && error.code !== "42883") throw error;

  const mensualidad = await db.mensualidad.findUnique({ where: { id: params.mensualidadId } });
  if (!mensualidad) throw new Error("Mensualidad no encontrada");
  // Stripe can emit checkout.session.completed and payment_intent.succeeded
  // for the same checkout. Avoid a second payment row in the fallback path
  // while the atomic Supabase RPC migration is being rolled out.
  if (mensualidad.estado === "PAGADO") return mensualidad;
  const existing = await db.pago.findFirst({
    where: { proveedor: params.proveedor, proveedorId: params.proveedorId },
  });
  if (!existing) {
    await db.pago.create({
      data: {
        mensualidadId: params.mensualidadId,
        monto: mensualidad.monto,
        metodoPago: params.metodoPago,
        proveedor: params.proveedor,
        proveedorId: params.proveedorId,
        procesadoPorId: params.procesadoPorId ?? null,
      },
    });
  }
  return db.mensualidad.update({
    where: { id: params.mensualidadId },
    data: {
      estado: "PAGADO",
      fechaPago: mensualidad.fechaPago || new Date(),
      metodoPago: params.metodoPago,
      referenciaPago: params.proveedorId,
    },
  });
}

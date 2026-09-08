import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { z } from "zod";
import { recordMonthlyPayment } from "@/lib/payments";

const schema = z.object({
  metodoPago: z.enum(["Efectivo", "Transferencia", "Stripe", "Conekta"]),
});

export async function POST(
  req: Request,
  props: { params: Promise<{ clubId: string; mensualidadId: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { metodoPago } = schema.parse(await req.json());

    const mensualidad = await db.mensualidad.findFirst({
      where: { id: params.mensualidadId, jugador: { equipo: { clubId: params.clubId } } },
    });

    if (!mensualidad) return NextResponse.json({ error: "Mensualidad no encontrada" }, { status: 404 });

    const updated = await recordMonthlyPayment({
      mensualidadId: params.mensualidadId,
      metodoPago,
      proveedor: metodoPago.toLowerCase(),
      proveedorId: `manual:${params.mensualidadId}`,
      procesadoPorId: session.user.id,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al registrar pago" }, { status: 500 });
  }
}

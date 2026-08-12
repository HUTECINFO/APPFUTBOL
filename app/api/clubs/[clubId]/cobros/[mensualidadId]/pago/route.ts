import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { z } from "zod";

const schema = z.object({
  metodoPago: z.enum(["Efectivo", "Transferencia", "Stripe", "Conekta"]),
});

export async function POST(
  req: Request,
  { params }: { params: { clubId: string; mensualidadId: string } }
) {
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

    const [updated] = await db.$transaction([
      db.mensualidad.update({
        where: { id: params.mensualidadId },
        data: {
          estado: "PAGADO",
          fechaPago: new Date(),
          metodoPago,
        },
      }),
      db.pago.create({
        data: {
          mensualidadId: params.mensualidadId,
          monto: mensualidad.monto,
          metodoPago,
          proveedor: metodoPago.toLowerCase(),
          procesadoPorId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al registrar pago" }, { status: 500 });
  }
}

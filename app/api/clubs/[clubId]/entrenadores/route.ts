import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { actorFromSession, canManageClub } from "@/lib/authorization";
import { createAccountActivationToken } from "@/lib/account-activation";
import { requestOrigin } from "@/lib/request-origin";

const schema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().optional(),
});

export async function GET(req: Request, props: { params: Promise<{ clubId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const entrenadores = await db.usuario.findMany({
    where: {
      rol: "ENTRENADOR",
      activo: true,
      equiposCoach: { some: { clubId: params.clubId } },
    },
    select: { id: true, nombre: true, email: true, telefono: true },
  });

  return NextResponse.json(entrenadores);
}

export async function POST(req: Request, props: { params: Promise<{ clubId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!(await canManageClub(actorFromSession(session), params.clubId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existente = await db.usuario.findUnique({ where: { email: data.email } });
    if (existente) {
      if (existente.rol !== "ENTRENADOR") {
        return NextResponse.json({ error: "Ya existe una cuenta con ese email con otro rol" }, { status: 409 });
      }
      const activationUrl = existente.password
        ? null
        : `${requestOrigin(req)}/activar-cuenta?token=${encodeURIComponent(
            createAccountActivationToken(existente.id, existente.email, "activate")
          )}`;
      return NextResponse.json({ entrenador: existente, activationUrl, yaExiste: true });
    }

    const entrenador = await db.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        rol: "ENTRENADOR",
      },
    });

    const activationUrl = `${requestOrigin(req)}/activar-cuenta?token=${encodeURIComponent(
      createAccountActivationToken(entrenador.id, entrenador.email, "activate")
    )}`;

    return NextResponse.json({ entrenador, activationUrl }, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Error al crear entrenador" }, { status: 500 });
  }
}

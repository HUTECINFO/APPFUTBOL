import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (session.user.role === "SUPER_ADMIN") {
    const clubs = await db.club.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { equipos: true, sedes: true } },
      },
    });
    return NextResponse.json(clubs);
  }

  const clubs = await db.club.findMany({
    where: {
      OR: [
        { admins: { some: { id: session.user.id } } },
        { equipos: { some: { entrenadorId: session.user.id } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { equipos: true, sedes: true } },
    },
  });

  return NextResponse.json(clubs);
}

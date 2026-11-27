import path from "path";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { actorFromSession, canManageClub, canManageTeam } from "@/lib/authorization";
import { ATRIBUTOS } from "@/lib/rubrica";
import { cargarRubricaClub, type RubricaAlumno } from "@/lib/rubrica-server";

// Plantilla "Perfiles Rúbrica" que entregan los colegios (formato Cumbres / Nexo FI).
const PLANTILLA = path.join(process.cwd(), "lib", "templates", "rubrica-cumbres.xlsx");
const PRIMERA_FILA = 21;
const FILAS_PLANTILLA = 35;

const numero = (v: unknown) => (v == null || v === "" ? null : Number(v));
const fecha = (v: unknown) => {
  if (!v) return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? null : `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
};

function competencia(alumno: RubricaAlumno) {
  const p = alumno.perfil ?? {};
  const e = alumno.estadisticas;
  return {
    partidosJugados: numero(p.partidosJugados) ?? e.partidosJugados,
    partidosTitular: numero(p.partidosTitular),
    partidosSuplente: numero(p.partidosSuplente),
    minutos: numero(p.minutos),
    participaciones: numero(p.participaciones),
    actitudDeportiva: p.actitudDeportiva ?? null,
    goles: numero(p.goles) ?? e.goles,
    asistenciasGol: numero(p.asistenciasGol),
    torneos: numero(p.torneos) ?? e.torneos,
    tarjetasAmarillas: numero(p.tarjetasAmarillas) ?? e.tarjetasAmarillas,
    tarjetasRojas: numero(p.tarjetasRojas) ?? e.tarjetasRojas,
    ligas: (Array.isArray(p.ligas) ? p.ligas : []) as string[],
    observaciones: p.observacionesCompeticion ?? null,
  };
}

function filaCaptura(alumno: RubricaAlumno) {
  const p = alumno.perfil ?? {};
  return [
    alumno.dorsal,
    alumno.nombre,
    alumno.posicion,
    p.matricula ?? null,
    fecha(alumno.fechaNacimiento),
    p.categoriaCompetitiva ?? null,
    numero(p.estatura),
    numero(p.peso),
    alumno.fotoUrl?.startsWith("http") ? alumno.fotoUrl : null,
    p.pieDominante ?? null,
    p.rolPrincipal ?? null,
    p.rolSecundario ?? null,
    p.perfilTecnicoTactico ?? null,
    p.fortalezas ?? null,
    p.areasOportunidad ?? null,
    p.objetivoIndividual ?? null,
    p.observacionesEntrenador ?? null,
    ...ATRIBUTOS.map((a) => numero(p[a.key])),
  ];
}

export async function GET(req: Request, props: { params: Promise<{ clubId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const equipoId = url.searchParams.get("equipoId") || undefined;
  const jugadorId = url.searchParams.get("jugadorId") || undefined;

  const club = await db.club.findUnique({ where: { id: params.clubId }, select: { id: true, nombre: true, esColegio: true } });
  if (!club?.esColegio) return NextResponse.json({ error: "La rúbrica solo está disponible para colegios" }, { status: 404 });

  const actor = actorFromSession(session);
  const esAdmin = await canManageClub(actor, params.clubId);
  if (!esAdmin) {
    if (actor.role !== "ENTRENADOR") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    if (equipoId && !(await canManageTeam(actor, params.clubId, equipoId))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const equipos = await cargarRubricaClub(params.clubId, {
    entrenadorId: esAdmin ? undefined : actor.userId,
    equipoId,
    jugadorId,
  });
  const alumnos = equipos.flatMap((e) => e.jugadores.map((j) => ({ ...j, equipo: e.nombre })));
  if (jugadorId && !alumnos.length) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(PLANTILLA);

  // Hoja "Captura CT": una fila por alumno desde la fila 21.
  const captura = workbook.getWorksheet("Captura CT")!;
  const estiloBase = captura.getRow(PRIMERA_FILA + FILAS_PLANTILLA - 1);
  alumnos.forEach((alumno, i) => {
    const row = captura.getRow(PRIMERA_FILA + i);
    row.getCell(1).value = i + 1;
    filaCaptura(alumno).forEach((valor, k) => {
      const cell = row.getCell(k + 2);
      cell.value = valor as ExcelJS.CellValue;
      if (i >= FILAS_PLANTILLA) cell.style = estiloBase.getCell(k + 2).style;
    });
    if (i >= FILAS_PLANTILLA) row.getCell(1).style = estiloBase.getCell(1).style;
    row.commit();
  });

  if (jugadorId) {
    // Perfil individual: llena la hoja "Observaciones" (datos de competición).
    const alumno = alumnos[0];
    const c = competencia(alumno);
    const hoja = workbook.getWorksheet("Observaciones")!;
    hoja.getCell("B7").value = `DATOS DE COMPETICIÓN · ${alumno.nombre}`;
    hoja.getCell("B9").value = `CATEGORIA\n${alumno.perfil?.categoriaCompetitiva ?? alumno.equipo}`;
    hoja.getCell("B9").alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    hoja.getCell("D9").value = c.partidosJugados;
    hoja.getCell("D10").value = c.partidosTitular;
    hoja.getCell("D11").value = c.partidosSuplente;
    hoja.getCell("D12").value = c.minutos;
    hoja.getCell("D13").value = c.participaciones;
    hoja.getCell("D14").value = c.actitudDeportiva;
    hoja.getCell("F9").value = c.goles;
    hoja.getCell("F10").value = c.asistenciasGol;
    hoja.getCell("F11").value = c.torneos;
    hoja.getCell("F12").value = c.tarjetasAmarillas;
    hoja.getCell("F13").value = c.tarjetasRojas;
    ["F14", "F15", "F16"].forEach((ref, i) => {
      hoja.getCell(ref).value = c.ligas[i] ? `${i + 1}. ${c.ligas[i]}` : i + 1;
    });
    hoja.getCell("B15").value = `OBSERVACIONES:\n${c.observaciones ?? ""}`;
    hoja.getCell("B15").alignment = { wrapText: true, vertical: "top" };
  } else {
    // Varios alumnos: tabla de datos de competición en una hoja adicional.
    const hoja = workbook.addWorksheet("Datos de competición");
    const encabezados = [
      "#", "Alumno", "Nombre", "Equipo", "Partidos jugados", "Titular", "Suplente", "Minutos", "Participaciones",
      "Actitud deportiva", "Goles", "Asistencias", "Torneos", "Tarjetas amarillas", "Tarjetas rojas", "Ligas", "Observaciones",
    ];
    hoja.addRow(encabezados);
    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    hoja.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
    alumnos.forEach((alumno, i) => {
      const c = competencia(alumno);
      hoja.addRow([
        i + 1, alumno.dorsal, alumno.nombre, alumno.equipo, c.partidosJugados, c.partidosTitular, c.partidosSuplente,
        c.minutos, c.participaciones, c.actitudDeportiva, c.goles, c.asistenciasGol, c.torneos, c.tarjetasAmarillas,
        c.tarjetasRojas, c.ligas.join("; "), c.observaciones,
      ]);
    });
    hoja.columns.forEach((col, i) => { col.width = i === 2 ? 28 : i === 16 ? 40 : 14; });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const base = jugadorId ? alumnos[0].nombre : equipoId ? equipos[0]?.nombre ?? club.nombre : club.nombre;
  const nombreArchivo = `Rubrica ${base}.xlsx`.replace(/[^\p{L}\p{N} ._-]/gu, "");

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombreArchivo)}`,
      "Cache-Control": "no-store",
    },
  });
}

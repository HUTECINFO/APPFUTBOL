/**
 * Convierte el club demo en colegio y le carga perfiles de rúbrica de ejemplo
 * (formato Cumbres). Requiere la migración 20261127010000_colegios_rubrica.sql.
 *
 *   npm run rubrica:seed
 */
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const CLUB_SLUG = "club-demo";

type Perfil = Record<string, unknown>;

const PERFILES: Record<string, Perfil> = {
  "Juan Pérez": {
    matricula: "240101", categoriaCompetitiva: "Menor", estatura: 1.62, peso: 50, pieDominante: "Derecho",
    rolPrincipal: "Portero líbero", rolSecundario: "Portero de área",
    perfilTecnicoTactico: "Portero que ordena la defensa y sale con seguridad a cortar centros. Busca iniciar el juego corto con los centrales y acepta el riesgo de jugar con el pie.",
    fortalezas: "Blocaje seguro; comunicación con la línea defensiva; salidas por alto; reflejos en mano a mano",
    areasOportunidad: "Precisión del saque largo con el pie izquierdo; colocación en balones a segundo palo",
    objetivoIndividual: "Acertar 7 de cada 10 saques largos al costado en partido.",
    observacionesEntrenador: "Muy comprometido en entrenamientos; buen liderazgo con el grupo.",
    gestoTecnico: 7, participacionJuego: 6.5, paseAcertado: 6, velocidad: 6, agilidad: 8, resistencia: 6.5, fuerza: 6, aptitudDeportiva: 9,
    partidosTitular: 9, partidosSuplente: 1, minutos: 810, participaciones: 10, actitudDeportiva: "Excelente",
    goles: 0, asistenciasGol: 1, ligas: ["Liga Escolar León", "Copa Cumbres"],
  },
  "Rafael Torres": {
    matricula: "240102", categoriaCompetitiva: "Menor", estatura: 1.58, peso: 47, pieDominante: "Izquierdo",
    rolPrincipal: "Central constructor", rolSecundario: "Lateral izquierdo",
    perfilTecnicoTactico: "Central zurdo que da salida limpia desde atrás. Lee bien la línea de pase y se perfila para progresar por dentro.",
    fortalezas: "Pase largo con zurda; anticipación; orden en la línea; juego aéreo defensivo",
    areasOportunidad: "Velocidad de repliegue a la espalda; duelos uno contra uno en campo abierto",
    objetivoIndividual: "Reducir las pérdidas en salida de balón bajo presión.",
    observacionesEntrenador: "Recuperado de molestia en tobillo; disponible sin restricciones.",
    gestoTecnico: 7.5, participacionJuego: 7, paseAcertado: 8, velocidad: 5.5, agilidad: 6, resistencia: 7, fuerza: 7, aptitudDeportiva: 8,
    partidosTitular: 8, partidosSuplente: 2, minutos: 720, participaciones: 10, actitudDeportiva: "Muy buena",
    asistenciasGol: 2, ligas: ["Liga Escolar León"],
  },
  "Miguel Sánchez": {
    matricula: "240103", categoriaCompetitiva: "Menor", estatura: 1.6, peso: 49, pieDominante: "Derecho",
    rolPrincipal: "Central corrector", rolSecundario: "Pivote defensivo",
    perfilTecnicoTactico: "Defensor agresivo en el duelo, cubre bien la espalda del compañero y gana muchos balones divididos.",
    fortalezas: "Duelos defensivos; velocidad de cobertura; intensidad; juego aéreo",
    areasOportunidad: "Primer pase tras recuperar; perfilarse antes de recibir",
    objetivoIndividual: "Dar un pase seguro en los 3 segundos posteriores a la recuperación.",
    gestoTecnico: 6, participacionJuego: 6.5, paseAcertado: 6, velocidad: 7.5, agilidad: 7, resistencia: 8, fuerza: 8, aptitudDeportiva: 8.5,
    partidosTitular: 9, partidosSuplente: 0, minutos: 790, participaciones: 9, actitudDeportiva: "Muy buena",
    ligas: ["Liga Escolar León", "Copa Cumbres"],
  },
  "Fernando González": {
    matricula: "240104", categoriaCompetitiva: "Menor", estatura: 1.55, peso: 44, pieDominante: "Derecho",
    rolPrincipal: "Pivote organizador", rolSecundario: "Interior de llegada",
    perfilTecnicoTactico: "Mediocentro que se ofrece constantemente entre líneas y marca el ritmo del equipo con pase corto.",
    fortalezas: "Escaneo previo; pase entre líneas; orientación corporal; constancia",
    areasOportunidad: "Disparo de media distancia; contacto en duelos",
    objetivoIndividual: "Intentar 2 disparos de media distancia por partido.",
    gestoTecnico: 8, participacionJuego: 8.5, paseAcertado: 8.5, velocidad: 6, agilidad: 7.5, resistencia: 7.5, fuerza: 5.5, aptitudDeportiva: 8,
    partidosTitular: 10, minutos: 860, participaciones: 10, actitudDeportiva: "Excelente",
    goles: 1, asistenciasGol: 5, ligas: ["Liga Escolar León"],
  },
  "Alejandro López": {
    matricula: "240105", categoriaCompetitiva: "Menor", estatura: 1.57, peso: 46, pieDominante: "Ambidiestro",
    rolPrincipal: "Interior de llegada", rolSecundario: "Extremo por dentro",
    perfilTecnicoTactico: "Interior con llegada al área y buena conducción. Ataca los espacios a la espalda del pivote rival.",
    fortalezas: "Conducción; llegada al área; uso de ambos perfiles; desmarque de ruptura",
    areasOportunidad: "Repliegue defensivo; toma de decisión en último tercio",
    objetivoIndividual: "Volver detrás del balón en cada pérdida durante el primer tiempo.",
    gestoTecnico: 7.5, participacionJuego: 7, paseAcertado: 7, velocidad: 7.5, agilidad: 8, resistencia: 6.5, fuerza: 6, aptitudDeportiva: 7,
    partidosTitular: 7, partidosSuplente: 3, minutos: 610, participaciones: 10, actitudDeportiva: "Buena",
    goles: 3, asistenciasGol: 3, ligas: ["Liga Escolar León", "Copa Cumbres"],
  },
  "Mateo Demo": {
    matricula: "240106", categoriaCompetitiva: "Menor", estatura: 1.54, peso: 43, pieDominante: "Derecho",
    rolPrincipal: "Mediocampista mixto", rolSecundario: "Lateral derecho",
    perfilTecnicoTactico: "Jugador trabajador que equilibra al equipo; ayuda en salida y presiona tras pérdida.",
    fortalezas: "Presión tras pérdida; resistencia; disciplina táctica",
    areasOportunidad: "Pase vertical; confianza para recibir de espaldas",
    objetivoIndividual: "Completar 5 pases progresivos por partido.",
    gestoTecnico: 6.5, participacionJuego: 7, paseAcertado: 6.5, velocidad: 7, agilidad: 7, resistencia: 8.5, fuerza: 6.5, aptitudDeportiva: 9,
    partidosTitular: 6, partidosSuplente: 4, minutos: 540, participaciones: 10, actitudDeportiva: "Excelente",
    goles: 1, asistenciasGol: 2, ligas: ["Liga Escolar León"],
  },
  "Carlos Martínez": {
    matricula: "240107", categoriaCompetitiva: "Menor", estatura: 1.6, peso: 48, pieDominante: "Derecho",
    rolPrincipal: "Delantero de área", rolSecundario: "Segundo punta",
    perfilTecnicoTactico: "Nueve de referencia que fija centrales y finaliza con pocos toques. Buen juego de espaldas para descargar.",
    fortalezas: "Definición; juego de espaldas; cabezazo ofensivo; movimientos en el área",
    areasOportunidad: "Participación en la presión alta; desmarques de apoyo",
    objetivoIndividual: "Iniciar la presión sobre el central en cada saque de meta rival.",
    gestoTecnico: 7.5, participacionJuego: 6.5, paseAcertado: 6.5, velocidad: 7, agilidad: 7, resistencia: 6, fuerza: 7.5, aptitudDeportiva: 7.5,
    partidosTitular: 9, partidosSuplente: 1, minutos: 760, participaciones: 10, actitudDeportiva: "Muy buena",
    goles: 8, asistenciasGol: 2, ligas: ["Liga Escolar León", "Copa Cumbres"],
  },
  "Diego Rodríguez": {
    matricula: "240108", categoriaCompetitiva: "Menor", estatura: 1.52, peso: 42, pieDominante: "Izquierdo",
    rolPrincipal: "Extremo desequilibrante", rolSecundario: "Mediapunta",
    perfilTecnicoTactico: "Extremo zurdo que encara en uno contra uno y busca el pase atrás. Rompe líneas en conducción.",
    fortalezas: "Regate; aceleración; centro raso; creatividad",
    areasOportunidad: "Lectura defensiva; resistencia en la segunda mitad",
    objetivoIndividual: "Mantener la intensidad en los últimos 15 minutos.",
    gestoTecnico: 8.5, participacionJuego: 7.5, paseAcertado: 7, velocidad: 8.5, agilidad: 9, resistencia: 5.5, fuerza: 5, aptitudDeportiva: 7,
    partidosTitular: 8, partidosSuplente: 2, minutos: 650, participaciones: 10, actitudDeportiva: "Buena",
    goles: 5, asistenciasGol: 6, ligas: ["Liga Escolar León"],
  },
  "Sofía Mendez": {
    matricula: "240109", categoriaCompetitiva: "Menor", estatura: 1.5, peso: 41, pieDominante: "Derecho",
    rolPrincipal: "Delantera móvil", rolSecundario: "Extrema derecha",
    perfilTecnicoTactico: "Delantera que cae a banda para recibir y ataca el espacio con velocidad. Buena finalización cruzada.",
    fortalezas: "Velocidad; desmarque de ruptura; definición; competitividad",
    areasOportunidad: "Juego de espaldas; pase de primera",
    objetivoIndividual: "Asociarse de primera con la mediocampista en cada ataque posicional.",
    gestoTecnico: 7, participacionJuego: 7, paseAcertado: 6.5, velocidad: 8.5, agilidad: 8, resistencia: 7, fuerza: 6, aptitudDeportiva: 8.5,
    partidosTitular: 7, minutos: 600, participaciones: 7, actitudDeportiva: "Muy buena",
    goles: 6, asistenciasGol: 1, ligas: ["Liga Femenil Escolar León"],
  },
  // Andrea López se deja sin capturar para mostrar un perfil pendiente.
};

async function main() {
  const { data: club, error } = await supabase.from("clubs").select("id, nombre").eq("slug", CLUB_SLUG).single();
  if (error || !club) throw new Error(`No se encontró el club ${CLUB_SLUG}: ${error?.message}`);

  const { error: clubError } = await supabase.from("clubs").update({ esColegio: true, updatedAt: new Date().toISOString() }).eq("id", club.id);
  if (clubError) throw new Error(`No se pudo marcar como colegio (¿falta la migración?): ${clubError.message}`);

  const { data: equipos } = await supabase.from("equipos").select("id").eq("clubId", club.id);
  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("id, nombre")
    .in("equipoId", (equipos ?? []).map((e) => e.id));
  const { data: coach } = await supabase.from("usuarios").select("id").eq("rol", "ENTRENADOR").limit(1).maybeSingle();

  let cargados = 0;
  for (const jugador of jugadores ?? []) {
    const perfil = PERFILES[jugador.nombre];
    if (!perfil) continue;
    const { data: existente } = await supabase.from("perfiles_deportivos").select("id").eq("jugadorId", jugador.id).maybeSingle();
    const fila = {
      ...perfil,
      ligas: perfil.ligas ?? [],
      jugadorId: jugador.id,
      clubId: club.id,
      evaluadoPorId: coach?.id ?? null,
      updatedAt: new Date().toISOString(),
    };
    const { error: perfilError } = existente
      ? await supabase.from("perfiles_deportivos").update(fila).eq("id", existente.id)
      : await supabase.from("perfiles_deportivos").insert({ id: randomUUID(), ...fila });
    if (perfilError) throw new Error(`${jugador.nombre}: ${perfilError.message}`);
    cargados++;
  }

  console.log(`${club.nombre}: marcado como colegio, ${cargados} perfiles de rúbrica cargados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const RolUsuario = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CLUB_ADMIN: "CLUB_ADMIN",
  ENTRENADOR: "ENTRENADOR",
  JUGADOR: "JUGADOR",
  TUTOR: "TUTOR",
} as const;

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const superAdmin = await db.usuario.upsert({
    where: { email: "super@clubone.io" },
    update: { password, rol: RolUsuario.SUPER_ADMIN, activo: true },
    create: {
      nombre: "Super Admin",
      email: "super@clubone.io",
      password,
      rol: RolUsuario.SUPER_ADMIN,
      activo: true,
    },
  });

  const club = await db.club.upsert({
    where: { slug: "club-demo" },
    update: {},
    create: {
      nombre: "Club Demo Club One",
      slug: "club-demo",
      colorPrimario: "#1FCB6B",
      colorSecundario: "#F2B33D",
      feeMensual: 1500,
      porcentajePlataforma: 5,
    },
  });

  const clubAdmin = await db.usuario.upsert({
    where: { email: "club@demo.mx" },
    update: {
      password: await bcrypt.hash("club123", 10),
      rol: RolUsuario.CLUB_ADMIN,
      activo: true,
      clubesAdmin: { connect: { id: club.id } },
    },
    create: {
      nombre: "Admin del Club",
      email: "club@demo.mx",
      password: await bcrypt.hash("club123", 10),
      rol: RolUsuario.CLUB_ADMIN,
      activo: true,
      clubesAdmin: { connect: { id: club.id } },
    },
  });

  const coach = await db.usuario.upsert({
    where: { email: "coach@demo.mx" },
    update: {
      password: await bcrypt.hash("coach123", 10),
      rol: RolUsuario.ENTRENADOR,
      activo: true,
    },
    create: {
      nombre: "Entrenador Demo",
      email: "coach@demo.mx",
      password: await bcrypt.hash("coach123", 10),
      rol: RolUsuario.ENTRENADOR,
      activo: true,
    },
  });

  // Crear usuario jugador
  const jugadorUser = await db.usuario.upsert({
    where: { email: "jugador@demo.mx" },
    update: {
      password: await bcrypt.hash("jugador123", 10),
      rol: RolUsuario.JUGADOR,
      activo: true,
    },
    create: {
      nombre: "Carlos Martínez",
      email: "jugador@demo.mx",
      password: await bcrypt.hash("jugador123", 10),
      rol: RolUsuario.JUGADOR,
      activo: true,
    },
  });

  // Crear tutor
  const tutor = await db.usuario.upsert({
    where: { email: "tutor@demo.mx" },
    update: {
      password: await bcrypt.hash("tutor123", 10),
      rol: RolUsuario.TUTOR,
      activo: true,
    },
    create: {
      nombre: "María González (Tutora)",
      email: "tutor@demo.mx",
      password: await bcrypt.hash("tutor123", 10),
      rol: RolUsuario.TUTOR,
      activo: true,
    },
  });

  // El seed restablece únicamente el club demo para ser repetible sin tocar otros tenants.
  await db.equipo.deleteMany({ where: { clubId: club.id } });
  await db.sede.deleteMany({ where: { clubId: club.id } });

  const equipo = await db.equipo.upsert({
    where: { id: "equipo-demo" },
    update: {},
    create: {
      id: "equipo-demo",
      nombre: "Sub-13 Varonil",
      categoria: "Sub-13",
      genero: "Varonil",
      clubId: club.id,
      entrenadorId: coach.id,
    },
  });

  const sede = await db.sede.upsert({
    where: { id: "sede-demo" },
    update: {},
    create: {
      id: "sede-demo",
      clubId: club.id,
      nombre: "Sede Principal",
      direccion: "Avenida Paseo de la Reforma 505, Ciudad de México",
      lat: 19.4326,
      lng: -99.1332,
    },
  });

  // Crear segundo equipo
  const equipo2 = await db.equipo.create({
    data: {
      nombre: "Sub-13 Femenil",
      categoria: "Sub-13",
      genero: "Femenil",
      clubId: club.id,
      entrenadorId: coach.id,
    },
  });

  // Crear jugadores
  const jugadores = await Promise.all([
    db.jugador.create({
      data: {
        nombre: "Carlos Martínez",
        apodo: "El Rápido",
        posicion: "Delantero",
        dorsal: 9,
        fechaNacimiento: new Date("2013-05-15"),
        equipoId: equipo.id,
        usuarioId: jugadorUser.id,
        contactoEmergenciaNombre: "María Martínez",
        contactoEmergenciaTelefono: "5511112233",
        alergias: "Alergia al polen",
        tipoSangre: "O+",
        seguroMedicoProveedor: "GNP",
        seguroMedicoPoliza: "POL-001",
        documentos: [
          { nombre: "acta_nacimiento.pdf", base64: "data:application/pdf;base64,JVBERi0xLg==", mimeType: "application/pdf", uploadedAt: new Date().toISOString() },
        ],
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Diego Rodríguez",
        apodo: "Rodri",
        posicion: "Delantero",
        dorsal: 10,
        fechaNacimiento: new Date("2013-03-20"),
        equipoId: equipo.id,
        tutorId: tutor.id,
        contactoEmergenciaNombre: "Laura Rodríguez",
        contactoEmergenciaTelefono: "5522223344",
        alergias: "Ninguna",
        tipoSangre: "A+",
        seguroMedicoProveedor: "Axa",
        seguroMedicoPoliza: "POL-002",
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Alejandro López",
        posicion: "Mediocampista",
        dorsal: 8,
        fechaNacimiento: new Date("2013-07-10"),
        equipoId: equipo.id,
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Miguel Sánchez",
        posicion: "Defensa",
        dorsal: 4,
        fechaNacimiento: new Date("2013-01-25"),
        equipoId: equipo.id,
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Juan Pérez",
        posicion: "Portero",
        dorsal: 1,
        fechaNacimiento: new Date("2013-09-12"),
        equipoId: equipo.id,
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Fernando González",
        posicion: "Mediocampista",
        dorsal: 5,
        fechaNacimiento: new Date("2013-11-08"),
        equipoId: equipo.id,
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Rafael Torres",
        posicion: "Defensa",
        dorsal: 3,
        fechaNacimiento: new Date("2013-04-30"),
        equipoId: equipo.id,
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Sofía Mendez",
        posicion: "Delantera",
        dorsal: 7,
        fechaNacimiento: new Date("2013-06-18"),
        equipoId: equipo2.id,
        contactoEmergenciaNombre: "Diana Mendez",
        contactoEmergenciaTelefono: "5533334455",
        alergias: "Intolerancia a la lactosa",
        tipoSangre: "B+",
        seguroMedicoProveedor: "MetLife",
        seguroMedicoPoliza: "POL-003",
      },
    }),
    db.jugador.create({
      data: {
        nombre: "Andrea López",
        posicion: "Mediocampista",
        dorsal: 11,
        fechaNacimiento: new Date("2013-08-22"),
        equipoId: equipo2.id,
        contactoEmergenciaNombre: "Patricia López",
        contactoEmergenciaTelefono: "5544445566",
        tipoSangre: "O-",
        seguroMedicoProveedor: "Qualitas",
        seguroMedicoPoliza: "POL-004",
      },
    }),
  ]);

  // Crear eventos (partidos y entrenamientos)
  const hoy = new Date();
  const eventos = await Promise.all([
    db.evento.create({
      data: {
        equipoId: equipo.id,
        tipo: "ENTRENAMIENTO",
        titulo: "Entrenamiento técnico-táctico",
        fecha: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 días después
        sedeId: sede.id,
        descripcion: "Enfoque en pases y control de balón",
      },
    }),
    db.evento.create({
      data: {
        equipoId: equipo.id,
        tipo: "PARTIDO",
        titulo: "Sub-13 vs FC Juventud",
        fecha: new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días después
        sedeId: sede.id,
        rival: "FC Juventud",
        descripcion: "Jornada 5 de la liga",
      },
    }),
    db.evento.create({
      data: {
        equipoId: equipo.id,
        tipo: "PARTIDO",
        titulo: "Sub-13 vs Eagles FC",
        fecha: new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás (pasado)
        sedeId: sede.id,
        rival: "Eagles FC",
        marcadorLocal: 3,
        marcadorVisitante: 1,
        terminado: true,
      },
    }),
    db.evento.create({
      data: {
        equipoId: equipo.id,
        tipo: "ENTRENAMIENTO",
        titulo: "Preparación física",
        fecha: new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        sedeId: sede.id,
        terminado: true,
      },
    }),
  ]);

  // Crear asistencias para evento pasado
  await Promise.all(
    jugadores.slice(0, 5).map((j) =>
      db.asistencia.create({
        data: {
          eventoId: eventos[2].id,
          jugadorId: j.id,
          estado: j.id === jugadores[4].id ? "NO_ASISTIO" : "ASISTIO",
        },
      })
    )
  );

  // Crear goles en el partido pasado
  await Promise.all([
    db.gol.create({
      data: {
        eventoId: eventos[2].id,
        jugadorId: jugadores[0].id,
        minuto: 15,
        tipo: "normal",
      },
    }),
    db.gol.create({
      data: {
        eventoId: eventos[2].id,
        jugadorId: jugadores[1].id,
        minuto: 34,
        tipo: "normal",
      },
    }),
    db.gol.create({
      data: {
        eventoId: eventos[2].id,
        jugadorId: jugadores[0].id,
        minuto: 67,
        tipo: "normal",
      },
    }),
  ]);

  // Crear tarjetas
  await Promise.all([
    db.tarjeta.create({
      data: {
        eventoId: eventos[2].id,
        jugadorId: jugadores[3].id,
        color: "amarilla",
        minuto: 45,
      },
    }),
    db.tarjeta.create({
      data: {
        eventoId: eventos[2].id,
        jugadorId: jugadores[2].id,
        color: "amarilla",
        minuto: 72,
      },
    }),
  ]);

  // Crear mensualidades
  const periodos = ["2026-06", "2026-07", "2026-08"];
  await Promise.all(
    jugadores.slice(0, 3).flatMap((j) =>
      periodos.map((periodo, idx) =>
        db.mensualidad.create({
          data: {
            jugadorId: j.id,
            periodo,
            monto: 1500,
            estado: idx === 0 ? "PAGADO" : idx === 1 ? "PENDIENTE" : "VENCIDO",
            fechaPago: idx === 0 ? new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000) : undefined,
            metodoPago: idx === 0 ? "Transferencia" : undefined,
          },
        })
      )
    )
  );

  // Crear chat de equipo
  const chat = await db.chat.create({
    data: {
      equipoId: equipo.id,
      tipo: "equipo",
      nombre: "Chat Sub-13 Varonil",
    },
  });

  // Agregar miembros al chat
  await Promise.all([coach, clubAdmin, jugadorUser].map((u) =>
    db.chatMiembro.create({
      data: {
        chatId: chat.id,
        usuarioId: u.id,
      },
    })
  ));

  // Crear mensajes de ejemplo
  await Promise.all([
    db.mensajeChat.create({
      data: {
        chatId: chat.id,
        autorId: coach.id,
        contenido: "¡Hola equipo! Próximo entrenamiento es en 2 días. Vengan hidratados.",
      },
    }),
    db.mensajeChat.create({
      data: {
        chatId: chat.id,
        autorId: jugadorUser.id,
        contenido: "¡Listos para entrenar, profe!",
      },
    }),
    db.mensajeChat.create({
      data: {
        chatId: chat.id,
        autorId: coach.id,
        contenido: "Excelente actitud Carlos. Eso es lo que quiero ver.",
      },
    }),
  ]);

  console.log("✅ Seed completado:");
  console.log({
    cuentas: {
      superAdmin: "super@clubone.io / admin123",
      clubAdmin: "club@demo.mx / club123",
      entrenador: "coach@demo.mx / coach123",
      jugador: "jugador@demo.mx / jugador123",
      tutor: "tutor@demo.mx / tutor123",
    },
    club: club.nombre,
    equipos: [equipo.nombre, equipo2.nombre],
    jugadores: jugadores.length,
    eventos: eventos.length,
    mensualidades: periodos.length * 3,
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });

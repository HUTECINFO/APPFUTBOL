import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const tourTeams = [
  { id: "tour-2026-el-paso", nombre: "El Paso", categoria: "19–20 Septiembre 2026" },
  { id: "tour-2026-dallas-fort-worth", nombre: "Dallas–Fort Worth", categoria: "3–4 Octubre 2026" },
  { id: "tour-2026-houston", nombre: "Houston", categoria: "17–18 Octubre 2026" },
  { id: "tour-2026-san-antonio", nombre: "San Antonio", categoria: "31 Octubre–1 Noviembre 2026" },
];

async function main() {
  const club = await db.club.upsert({
    where: { slug: "usa-goalkeeper-tour-2026" },
    update: {
      nombre: "Club One · USA Goalkeeper Tour 2026",
      colorPrimario: "#1FCB6B",
      colorSecundario: "#F2B33D",
      activo: true,
    },
    create: {
      nombre: "Club One · USA Goalkeeper Tour 2026",
      slug: "usa-goalkeeper-tour-2026",
      colorPrimario: "#1FCB6B",
      colorSecundario: "#F2B33D",
      activo: true,
    },
  });

  await Promise.all(
    tourTeams.map((team) =>
      db.equipo.upsert({
        where: { id: team.id },
        update: { ...team, clubId: club.id, genero: "Mixto", cupoMaximo: 60, activo: true },
        create: { ...team, clubId: club.id, genero: "Mixto", cupoMaximo: 60, activo: true },
      })
    )
  );

  await db.usuario.upsert({
    where: { email: "tour@clubone.io" },
    update: {
      password: await bcrypt.hash("tour2026", 10),
      rol: "CLUB_ADMIN",
      activo: true,
      clubesAdmin: { connect: { id: club.id } },
    },
    create: {
      nombre: "Admin USA Goalkeeper Tour",
      email: "tour@clubone.io",
      password: await bcrypt.hash("tour2026", 10),
      rol: "CLUB_ADMIN",
      activo: true,
      clubesAdmin: { connect: { id: club.id } },
    },
  });

  console.log("Registro público del USA Goalkeeper Tour listo con 4 sedes.");
  console.log("Admin del evento: tour@clubone.io / tour2026");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

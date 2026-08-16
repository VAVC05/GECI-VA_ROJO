// Script de datos de prueba (seed) para GECI-VA.
//
// Esto NO son datos reales de la Coordinación, son solo para poder probar el sistema mientras se desarrolla


import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Creación de los seis roles 

const ROLES = [
  {
    nombre: "Administrador",
    descripcion:
      "Control total del sistema: gestión de usuarios, roles y configuración general.",
  },
  {
    nombre: "Tecnico Operativo",
    descripcion:
      "Registra y da seguimiento operativo a los incidentes y sus formularios SCI.",
  },
  {
    nombre: "Jefe Bomberos",
    descripcion: "Coordina los recursos y el personal de bomberos asignado al incidente.",
  },
  {
    nombre: "Jefe Paramedicos",
    descripcion: "Coordina la atención médica y el registro de víctimas del incidente.",
  },
  {
    nombre: "Personal Operativo",
    descripcion: "Personal de campo con acceso limitado a consulta y captura básica.",
  },
  {
    nombre: "Usuario Administrativo",
    descripcion: "Acceso de solo consulta a reportes y estadísticas generales.",
  },
];

// Contraseña temporal para TODOS los usuarios de prueba. Cumple la regla de HU-007 (mínimo 8 caracteres, una mayúscula, un número)  Esto es solo para desarrollo: en producción cada quien la cambia
// en su primer inicio de sesión.
const PASSWORD_PRUEBA = "Geciva2026!";

async function main() {
  console.log("Sembrando roles...");
  const rolesCreados = new Map<string, number>();

  for (const rol of ROLES) {
    const creado = await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol,
    });
    rolesCreados.set(rol.nombre, creado.idRol);
  }

  console.log("Sembrando un usuario de prueba por cada rol...");
  const hashContrasena = await bcrypt.hash(PASSWORD_PRUEBA, 10);

  const usuariosPrueba = [
    { nombre: "Victor Andres Villanueva Castañeda", correo: "admin@geciva.mx", rol: "Administrador" },
    { nombre: "Tecnico de Prueba", correo: "tecnico@geciva.mx", rol: "Tecnico Operativo" },
    { nombre: "Jefe de Bomberos de Prueba", correo: "bomberos@geciva.mx", rol: "Jefe Bomberos" },
    { nombre: "Jefe de Paramedicos de Prueba", correo: "paramedicos@geciva.mx", rol: "Jefe Paramedicos" },
    { nombre: "Personal Operativo de Prueba", correo: "operativo@geciva.mx", rol: "Personal Operativo" },
    { nombre: "Usuario Administrativo de Prueba", correo: "administrativo@geciva.mx", rol: "Usuario Administrativo" },
  ];

  let idAdmin = 0;

  for (const u of usuariosPrueba) {
    const idRol = rolesCreados.get(u.rol)!;
    const usuario = await prisma.usuario.upsert({
      where: { correo: u.correo },
      update: {},
      create: {
        nombreCompleto: u.nombre,
        correo: u.correo,
        contrasenaHash: hashContrasena,
        idRol,
      },
    });
    if (u.rol === "Administrador") idAdmin = usuario.idUsuario;
  }

  console.log("Sembrando un incidente de ejemplo con su primer periodo operacional...");
  const incidente = await prisma.incidente.upsert({
    where: { folio: "GECIVA-2026-0001" },
    update: {},
    create: {
      folio: "GECIVA-2026-0001",
      nombre: "Incendio bodega industrial (datos de prueba)",
      fechaHoraInicio: new Date(),
      lugar: "Av. Tecnológico 100, Metepec, Estado de México",
      tipo: "Incendio",
      idUsuarioRegistro: idAdmin,
    },
  });

  await prisma.periodoOperacional.upsert({
    where: {
      idIncidente_numeroPeriodo: { idIncidente: incidente.idIncidente, numeroPeriodo: 1 },
    },
    update: {},
    create: {
      idIncidente: incidente.idIncidente,
      numeroPeriodo: 1,
      fechaHoraInicio: new Date(),
      fechaHoraFin: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
  });

  console.log("Listo. Roles, usuarios de prueba e incidente de ejemplo sembrados.");
  console.log(`Todos los usuarios de prueba usan la contraseña: ${PASSWORD_PRUEBA}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

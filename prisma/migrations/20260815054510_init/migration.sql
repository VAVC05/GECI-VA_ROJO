-- CreateEnum
CREATE TYPE "EstadoIncidente" AS ENUM ('ACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoRecurso" AS ENUM ('DISPONIBLE', 'ASIGNADO', 'NO_DISPONIBLE');

-- CreateEnum
CREATE TYPE "EstadoVictima" AS ENUM ('EN_ESPERA', 'ATENDIDO_EN_SITIO', 'TRASLADADO');

-- CreateEnum
CREATE TYPE "ClasificacionTriage" AS ENUM ('ROJO', 'AMARILLO', 'VERDE', 'NEGRO');

-- CreateEnum
CREATE TYPE "TipoFormularioSci" AS ENUM ('SCI_201', 'SCI_202', 'SCI_205', 'SCI_206', 'SCI_207', 'SCI_211');

-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contrasena_hash" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_ultimo_acceso" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "incidentes" (
    "id_incidente" SERIAL NOT NULL,
    "folio" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_hora_cierre" TIMESTAMP(3),
    "lugar" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "amenazas_presentes" TEXT,
    "areas_afectadas" TEXT,
    "objetivo_inicial" TEXT,
    "ubicacion_pc" TEXT,
    "ubicacion_ae" TEXT,
    "ruta_ingreso" TEXT,
    "ruta_egreso" TEXT,
    "mensaje_seguridad" TEXT,
    "canales_comunicacion" TEXT,
    "estado" "EstadoIncidente" NOT NULL DEFAULT 'ACTIVO',
    "observaciones_cierre" TEXT,
    "id_usuario_registro" INTEGER NOT NULL,
    "id_usuario_cierre" INTEGER,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidentes_pkey" PRIMARY KEY ("id_incidente")
);

-- CreateTable
CREATE TABLE "periodos_operacionales" (
    "id_periodo" SERIAL NOT NULL,
    "id_incidente" INTEGER NOT NULL,
    "numero_periodo" INTEGER NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_hora_fin" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "periodos_operacionales_pkey" PRIMARY KEY ("id_periodo")
);

-- CreateTable
CREATE TABLE "recursos" (
    "id_recurso" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "clase" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "institucion" VARCHAR(150),
    "matricula" VARCHAR(50),
    "numero_personas" INTEGER,
    "estado" "EstadoRecurso" NOT NULL DEFAULT 'DISPONIBLE',

    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id_recurso")
);

-- CreateTable
CREATE TABLE "asignaciones_recurso" (
    "id_asignacion" SERIAL NOT NULL,
    "id_incidente" INTEGER NOT NULL,
    "id_recurso" INTEGER NOT NULL,
    "fecha_hora_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tarea_asignada" TEXT,
    "ubicacion_asignacion" TEXT,
    "fecha_hora_desmovilizacion" TIMESTAMP(3),
    "observaciones_desmovilizacion" TEXT,
    "id_usuario_asigno" INTEGER NOT NULL,

    CONSTRAINT "asignaciones_recurso_pkey" PRIMARY KEY ("id_asignacion")
);

-- CreateTable
CREATE TABLE "planes_accion" (
    "id_pai" SERIAL NOT NULL,
    "id_incidente" INTEGER NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "objetivos_operacionales" TEXT NOT NULL,
    "estrategias" TEXT,
    "tacticas" TEXT,
    "recursos_en_lugar" TEXT,
    "recursos_por_solicitar" TEXT,
    "mensaje_seguridad" TEXT,
    "pronostico_tiempo" TEXT,
    "nombre_jefe_planificacion" TEXT,
    "fecha_hora_preparacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_accion_pkey" PRIMARY KEY ("id_pai")
);

-- CreateTable
CREATE TABLE "victimas" (
    "id_victima" SERIAL NOT NULL,
    "id_incidente" INTEGER NOT NULL,
    "nombre_paciente" VARCHAR(150),
    "sexo" VARCHAR(20),
    "edad" INTEGER,
    "lugar_registro" VARCHAR(100) NOT NULL,
    "fecha_hora_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_atencion" "EstadoVictima" NOT NULL DEFAULT 'EN_ESPERA',
    "lugar_traslado" TEXT,
    "centro_hospitalario" VARCHAR(150),
    "fecha_hora_traslado" TIMESTAMP(3),
    "notas_adicionales" VARCHAR(500),
    "id_usuario_registro" INTEGER NOT NULL,

    CONSTRAINT "victimas_pkey" PRIMARY KEY ("id_victima")
);

-- CreateTable
CREATE TABLE "historial_triage" (
    "id_evaluacion" SERIAL NOT NULL,
    "id_victima" INTEGER NOT NULL,
    "clasificacion" "ClasificacionTriage" NOT NULL,
    "fecha_hora_clasificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario_clasifico" INTEGER NOT NULL,

    CONSTRAINT "historial_triage_pkey" PRIMARY KEY ("id_evaluacion")
);

-- CreateTable
CREATE TABLE "formularios_sci" (
    "id_formulario" SERIAL NOT NULL,
    "id_incidente" INTEGER NOT NULL,
    "tipo_formulario" "TipoFormularioSci" NOT NULL,
    "contenido" JSONB NOT NULL,
    "fecha_hora_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario_genero" INTEGER NOT NULL,

    CONSTRAINT "formularios_sci_pkey" PRIMARY KEY ("id_formulario")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "accion" VARCHAR(100) NOT NULL,
    "entidad_afectada" VARCHAR(100) NOT NULL,
    "id_entidad_afectada" INTEGER,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalles" JSONB,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "incidentes_folio_key" ON "incidentes"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_operacionales_id_incidente_numero_periodo_key" ON "periodos_operacionales"("id_incidente", "numero_periodo");

-- CreateIndex
CREATE UNIQUE INDEX "planes_accion_id_periodo_key" ON "planes_accion"("id_periodo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_id_usuario_registro_fkey" FOREIGN KEY ("id_usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_id_usuario_cierre_fkey" FOREIGN KEY ("id_usuario_cierre") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_operacionales" ADD CONSTRAINT "periodos_operacionales_id_incidente_fkey" FOREIGN KEY ("id_incidente") REFERENCES "incidentes"("id_incidente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_recurso" ADD CONSTRAINT "asignaciones_recurso_id_incidente_fkey" FOREIGN KEY ("id_incidente") REFERENCES "incidentes"("id_incidente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_recurso" ADD CONSTRAINT "asignaciones_recurso_id_recurso_fkey" FOREIGN KEY ("id_recurso") REFERENCES "recursos"("id_recurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_recurso" ADD CONSTRAINT "asignaciones_recurso_id_usuario_asigno_fkey" FOREIGN KEY ("id_usuario_asigno") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_accion" ADD CONSTRAINT "planes_accion_id_incidente_fkey" FOREIGN KEY ("id_incidente") REFERENCES "incidentes"("id_incidente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_accion" ADD CONSTRAINT "planes_accion_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodos_operacionales"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "victimas" ADD CONSTRAINT "victimas_id_incidente_fkey" FOREIGN KEY ("id_incidente") REFERENCES "incidentes"("id_incidente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "victimas" ADD CONSTRAINT "victimas_id_usuario_registro_fkey" FOREIGN KEY ("id_usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_triage" ADD CONSTRAINT "historial_triage_id_victima_fkey" FOREIGN KEY ("id_victima") REFERENCES "victimas"("id_victima") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_triage" ADD CONSTRAINT "historial_triage_id_usuario_clasifico_fkey" FOREIGN KEY ("id_usuario_clasifico") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_sci" ADD CONSTRAINT "formularios_sci_id_incidente_fkey" FOREIGN KEY ("id_incidente") REFERENCES "incidentes"("id_incidente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_sci" ADD CONSTRAINT "formularios_sci_id_usuario_genero_fkey" FOREIGN KEY ("id_usuario_genero") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

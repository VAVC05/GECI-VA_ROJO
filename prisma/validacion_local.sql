-- Traducción manual del schema.prisma a SQL, usada SOLO para validar
-- localmente que el modelo relacional es correcto (PK, FK, UNIQUE,
-- tipos) antes de que el schema real se aplique con `prisma migrate`
-- en un entorno con acceso a los binarios de Prisma.

CREATE TYPE estado_incidente AS ENUM ('ACTIVO', 'CERRADO');
CREATE TYPE estado_recurso AS ENUM ('DISPONIBLE', 'ASIGNADO', 'NO_DISPONIBLE');
CREATE TYPE estado_victima AS ENUM ('EN_ESPERA', 'ATENDIDO_EN_SITIO', 'TRASLADADO');
CREATE TYPE clasificacion_triage AS ENUM ('ROJO', 'AMARILLO', 'VERDE', 'NEGRO');
CREATE TYPE tipo_formulario_sci AS ENUM ('SCI_201', 'SCI_202', 'SCI_205', 'SCI_206', 'SCI_207', 'SCI_211');

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL REFERENCES roles(id_rol),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT now(),
    fecha_ultimo_acceso TIMESTAMP
);

CREATE TABLE incidentes (
    id_incidente SERIAL PRIMARY KEY,
    folio VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_cierre TIMESTAMP,
    lugar VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    amenazas_presentes TEXT,
    areas_afectadas TEXT,
    objetivo_inicial TEXT,
    ubicacion_pc TEXT,
    ubicacion_ae TEXT,
    ruta_ingreso TEXT,
    ruta_egreso TEXT,
    mensaje_seguridad TEXT,
    canales_comunicacion TEXT,
    estado estado_incidente NOT NULL DEFAULT 'ACTIVO',
    observaciones_cierre TEXT,
    id_usuario_registro INT NOT NULL REFERENCES usuarios(id_usuario),
    id_usuario_cierre INT REFERENCES usuarios(id_usuario),
    fecha_modificacion TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE periodos_operacionales (
    id_periodo SERIAL PRIMARY KEY,
    id_incidente INT NOT NULL REFERENCES incidentes(id_incidente),
    numero_periodo INT NOT NULL,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    observaciones TEXT,
    UNIQUE (id_incidente, numero_periodo)
);

CREATE TABLE recursos (
    id_recurso SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    clase VARCHAR(100) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    institucion VARCHAR(150),
    matricula VARCHAR(50),
    numero_personas INT,
    estado estado_recurso NOT NULL DEFAULT 'DISPONIBLE'
);

CREATE TABLE asignaciones_recurso (
    id_asignacion SERIAL PRIMARY KEY,
    id_incidente INT NOT NULL REFERENCES incidentes(id_incidente),
    id_recurso INT NOT NULL REFERENCES recursos(id_recurso),
    fecha_hora_asignacion TIMESTAMP NOT NULL DEFAULT now(),
    tarea_asignada TEXT,
    ubicacion_asignacion TEXT,
    fecha_hora_desmovilizacion TIMESTAMP,
    observaciones_desmovilizacion TEXT,
    id_usuario_asigno INT NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE planes_accion (
    id_pai SERIAL PRIMARY KEY,
    id_incidente INT NOT NULL REFERENCES incidentes(id_incidente),
    id_periodo INT UNIQUE NOT NULL REFERENCES periodos_operacionales(id_periodo),
    objetivos_operacionales TEXT NOT NULL,
    estrategias TEXT,
    tacticas TEXT,
    recursos_en_lugar TEXT,
    recursos_por_solicitar TEXT,
    mensaje_seguridad TEXT,
    pronostico_tiempo TEXT,
    nombre_jefe_planificacion VARCHAR(150),
    fecha_hora_preparacion TIMESTAMP NOT NULL DEFAULT now(),
    fecha_modificacion TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE victimas (
    id_victima SERIAL PRIMARY KEY,
    id_incidente INT NOT NULL REFERENCES incidentes(id_incidente),
    nombre_paciente VARCHAR(150),
    sexo VARCHAR(20),
    edad INT,
    lugar_registro VARCHAR(100) NOT NULL,
    fecha_hora_registro TIMESTAMP NOT NULL DEFAULT now(),
    estado_atencion estado_victima NOT NULL DEFAULT 'EN_ESPERA',
    lugar_traslado TEXT,
    centro_hospitalario VARCHAR(150),
    fecha_hora_traslado TIMESTAMP,
    notas_adicionales VARCHAR(500),
    id_usuario_registro INT NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE historial_triage (
    id_evaluacion SERIAL PRIMARY KEY,
    id_victima INT NOT NULL REFERENCES victimas(id_victima),
    clasificacion clasificacion_triage NOT NULL,
    fecha_hora_clasificacion TIMESTAMP NOT NULL DEFAULT now(),
    id_usuario_clasifico INT NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE formularios_sci (
    id_formulario SERIAL PRIMARY KEY,
    id_incidente INT NOT NULL REFERENCES incidentes(id_incidente),
    tipo_formulario tipo_formulario_sci NOT NULL,
    contenido JSONB NOT NULL,
    fecha_hora_generacion TIMESTAMP NOT NULL DEFAULT now(),
    id_usuario_genero INT NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    accion VARCHAR(100) NOT NULL,
    entidad_afectada VARCHAR(100) NOT NULL,
    id_entidad_afectada INT,
    fecha_hora TIMESTAMP NOT NULL DEFAULT now(),
    detalles JSONB
);

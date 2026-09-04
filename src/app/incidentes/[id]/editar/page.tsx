"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface RolOrganizacion {
  rol: string;
  nombre: string;
}

interface PlanComunicaciones {
  sistema: string;
  canales: string;
  equipos: string;
}

interface PlanMedico {
  instalaciones: string;
  hospitales: string;
  personal: string;
}

export default function EditarIncidentePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [incidente, setIncidente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario (todos los campos)
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [lugar, setLugar] = useState("");
  const [amenazasPresentes, setAmenazasPresentes] = useState("");
  const [areasAfectadas, setAreasAfectadas] = useState("");
  const [objetivoInicial, setObjetivoInicial] = useState("");
  const [ubicacionPc, setUbicacionPc] = useState("");
  const [ubicacionAe, setUbicacionAe] = useState("");
  const [rutaIngreso, setRutaIngreso] = useState("");
  const [rutaEgreso, setRutaEgreso] = useState("");
  const [mensajeSeguridad, setMensajeSeguridad] = useState("");
  const [canalesComunicacion, setCanalesComunicacion] = useState("");
  const [organizacionSCI, setOrganizacionSCI] = useState<RolOrganizacion[]>([]);
  const [planComunicaciones, setPlanComunicaciones] = useState<PlanComunicaciones>({ sistema: "", canales: "", equipos: "" });
  const [planMedico, setPlanMedico] = useState<PlanMedico>({ instalaciones: "", hospitales: "", personal: "" });

  // Cargar datos
  useEffect(() => {
    if (id) {
      fetch(`/api/incidentes/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al cargar incidente");
          }
          return res.json();
        })
        .then((data) => {
          setIncidente(data);
          setNombre(data.nombre || "");
          setTipo(data.tipo || "");
          setLugar(data.lugar || "");
          setAmenazasPresentes(data.amenazasPresentes || "");
          setAreasAfectadas(data.areasAfectadas || "");
          setObjetivoInicial(data.objetivoInicial || "");
          setUbicacionPc(data.ubicacionPc || "");
          setUbicacionAe(data.ubicacionAe || "");
          setRutaIngreso(data.rutaIngreso || "");
          setRutaEgreso(data.rutaEgreso || "");
          setMensajeSeguridad(data.mensajeSeguridad || "");
          setCanalesComunicacion(data.canalesComunicacion || "");
          setOrganizacionSCI(data.organizacionSCI || []);
          setPlanComunicaciones(data.planComunicaciones || { sistema: "", canales: "", equipos: "" });
          setPlanMedico(data.planMedico || { instalaciones: "", hospitales: "", personal: "" });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const data = {
      nombre,
      tipo,
      lugar,
      amenazasPresentes,
      areasAfectadas,
      objetivoInicial,
      ubicacionPc,
      ubicacionAe,
      rutaIngreso,
      rutaEgreso,
      mensajeSeguridad,
      canalesComunicacion,
      organizacionSCI,
      planComunicaciones,
      planMedico,
    };

    try {
      const res = await fetch(`/api/incidentes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Incidente actualizado correctamente");
        setTimeout(() => {
          router.push(`/incidentes/${id}`);
        }, 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al actualizar el incidente");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const agregarRol = () => {
    setOrganizacionSCI([...organizacionSCI, { rol: "", nombre: "" }]);
  };

  const eliminarRol = (index: number) => {
    const nuevos = [...organizacionSCI];
    nuevos.splice(index, 1);
    setOrganizacionSCI(nuevos);
  };

  const actualizarRol = (index: number, campo: "rol" | "nombre", valor: string) => {
    const nuevos = [...organizacionSCI];
    nuevos[index][campo] = valor;
    setOrganizacionSCI(nuevos);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Cargando incidente...</p>
      </div>
    );
  }

  if (error && !incidente) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p className="text-red-600">Error: {error}</p>
        <Link href="/incidentes" className="text-rojo hover:underline mt-4 block font-medium">
          Volver al listado
        </Link>
      </div>
    );
  }

  if (!incidente) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Incidente no encontrado</p>
        <Link href="/incidentes" className="text-rojo hover:underline mt-4 block font-medium">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">Editar incidente {incidente.folio}</h1>
          <Link href={`/incidentes/${id}`} className="text-rojo hover:underline font-medium">
            ← Volver al detalle
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {/* Sección 1: Información básica */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Información básica</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo *
                </label>
                <input
                  type="text"
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">
                Lugar *
              </label>
              <input
                type="text"
                id="lugar"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                required
                className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              />
            </div>
          </div>

          {/* Sección 2: Información adicional */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Información adicional</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="amenazasPresentes" className="block text-sm font-medium text-gray-700">
                  Amenazas presentes
                </label>
                <input
                  type="text"
                  id="amenazasPresentes"
                  value={amenazasPresentes}
                  onChange={(e) => setAmenazasPresentes(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="areasAfectadas" className="block text-sm font-medium text-gray-700">
                  Áreas afectadas
                </label>
                <input
                  type="text"
                  id="areasAfectadas"
                  value={areasAfectadas}
                  onChange={(e) => setAreasAfectadas(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="objetivoInicial" className="block text-sm font-medium text-gray-700">
                  Objetivo inicial
                </label>
                <input
                  type="text"
                  id="objetivoInicial"
                  value={objetivoInicial}
                  onChange={(e) => setObjetivoInicial(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="ubicacionPc" className="block text-sm font-medium text-gray-700">
                  Ubicación Puesto de Comando
                </label>
                <input
                  type="text"
                  id="ubicacionPc"
                  value={ubicacionPc}
                  onChange={(e) => setUbicacionPc(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="ubicacionAe" className="block text-sm font-medium text-gray-700">
                  Ubicación Área de Espera
                </label>
                <input
                  type="text"
                  id="ubicacionAe"
                  value={ubicacionAe}
                  onChange={(e) => setUbicacionAe(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="rutaIngreso" className="block text-sm font-medium text-gray-700">
                  Ruta de ingreso
                </label>
                <input
                  type="text"
                  id="rutaIngreso"
                  value={rutaIngreso}
                  onChange={(e) => setRutaIngreso(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="rutaEgreso" className="block text-sm font-medium text-gray-700">
                  Ruta de egreso
                </label>
                <input
                  type="text"
                  id="rutaEgreso"
                  value={rutaEgreso}
                  onChange={(e) => setRutaEgreso(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="mensajeSeguridad" className="block text-sm font-medium text-gray-700">
                  Mensaje de seguridad
                </label>
                <input
                  type="text"
                  id="mensajeSeguridad"
                  value={mensajeSeguridad}
                  onChange={(e) => setMensajeSeguridad(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
              <div>
                <label htmlFor="canalesComunicacion" className="block text-sm font-medium text-gray-700">
                  Canales de comunicación
                </label>
                <input
                  type="text"
                  id="canalesComunicacion"
                  value={canalesComunicacion}
                  onChange={(e) => setCanalesComunicacion(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Organización del SCI (dinámica) */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Organización de la Emergencia (SCI)</h2>
              <button
                type="button"
                onClick={agregarRol}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
              >
                + Agregar rol
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Agrega los roles y las personas asignadas según la estructura del SCI.</p>

            {organizacionSCI.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">No hay roles definidos. Agrega el primero.</p>
            )}

            {organizacionSCI.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Rol (ej. Comandante)"
                  value={item.rol}
                  onChange={(e) => actualizarRol(index, "rol", e.target.value)}
                  className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
                <input
                  type="text"
                  placeholder="Nombre"
                  value={item.nombre}
                  onChange={(e) => actualizarRol(index, "nombre", e.target.value)}
                  className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                />
                <button
                  type="button"
                  onClick={() => eliminarRol(index)}
                  className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Sección 4: SCI-205 Plan de Comunicaciones */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-800">SCI-205 - Plan de Comunicaciones</h2>
            <p className="text-sm text-gray-500 mt-1">Define los sistemas, canales y equipos de comunicación para el incidente.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-2">
              <div>
                <label htmlFor="comSistema" className="block text-sm font-medium text-gray-700">Sistema/Equipo</label>
                <input
                  type="text"
                  id="comSistema"
                  value={planComunicaciones.sistema}
                  onChange={(e) => setPlanComunicaciones({ ...planComunicaciones, sistema: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                  placeholder="Ej. Radio Motorola, Teléfono Satelital"
                />
              </div>
              <div>
                <label htmlFor="comCanales" className="block text-sm font-medium text-gray-700">Canales/Frecuencias</label>
                <input
                  type="text"
                  id="comCanales"
                  value={planComunicaciones.canales}
                  onChange={(e) => setPlanComunicaciones({ ...planComunicaciones, canales: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                  placeholder="Ej. Canal 1, Frecuencia 151.XXX"
                />
              </div>
              <div>
                <label htmlFor="comEquipos" className="block text-sm font-medium text-gray-700">Equipos disponibles</label>
                <input
                  type="text"
                  id="comEquipos"
                  value={planComunicaciones.equipos}
                  onChange={(e) => setPlanComunicaciones({ ...planComunicaciones, equipos: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                  placeholder="Ej. 10 radios portátiles, 2 bases fijas"
                />
              </div>
            </div>
          </div>

          {/* Sección 5: SCI-206 Plan Médico */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-800">SCI-206 - Plan Médico</h2>
            <p className="text-sm text-gray-500 mt-1">Define las instalaciones médicas, hospitales de derivación y personal disponible.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-2">
              <div>
                <label htmlFor="medInstalaciones" className="block text-sm font-medium text-gray-700">Instalaciones médicas</label>
                <input
                  type="text"
                  id="medInstalaciones"
                  value={planMedico.instalaciones}
                  onChange={(e) => setPlanMedico({ ...planMedico, instalaciones: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                  placeholder="Ej. Puesto de socorro en sitio, Clínica móvil"
                />
              </div>
              <div>
                <label htmlFor="medHospitales" className="block text-sm font-medium text-gray-700">Hospitales de derivación</label>
                <input
                  type="text"
                  id="medHospitales"
                  value={planMedico.hospitales}
                  onChange={(e) => setPlanMedico({ ...planMedico, hospitales: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                  placeholder="Ej. Hospital General, IMSS, ISSSTE"
                />
              </div>
              <div>
                <label htmlFor="medPersonal" className="block text-sm font-medium text-gray-700">Personal médico</label>
                <input
                  type="text"
                  id="medPersonal"
                  value={planMedico.personal}
                  onChange={(e) => setPlanMedico({ ...planMedico, personal: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
                  placeholder="Ej. 3 Médicos, 5 Paramédicos, 2 Enfermeras"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                saving
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-carbon hover:bg-carbon-oscuro"
              }`}
            >
              {saving ? "Guardando..." : "Actualizar incidente"}
            </button>
            <Link
              href={`/incidentes/${id}`}
              className="rounded bg-gray-200 px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
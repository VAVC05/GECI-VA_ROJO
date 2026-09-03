"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Incidente {
  idIncidente: number;
  folio: string;
  nombre: string;
  tipo: string;
  lugar: string;
  estado: "ACTIVO" | "CERRADO";
  fechaHoraInicio: string;
  fechaHoraCierre: string | null;
  amenazasPresentes: string | null;
  areasAfectadas: string | null;
  objetivoInicial: string | null;
  ubicacionPc: string | null;
  ubicacionAe: string | null;
  rutaIngreso: string | null;
  rutaEgreso: string | null;
  mensajeSeguridad: string | null;
  canalesComunicacion: string | null;
}

export default function EditarIncidentePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [incidente, setIncidente] = useState<Incidente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario
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

  // Cargar datos del incidente
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Cargando incidente...</p>
      </div>
    );
  }

  if (error && !incidente) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p className="text-red-400">Error: {error}</p>
        <Link href="/incidentes" className="text-cyan-400 hover:underline mt-4 block">
          Volver al listado
        </Link>
      </div>
    );
  }

  if (!incidente) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Incidente no encontrado</p>
        <Link href="/incidentes" className="text-cyan-400 hover:underline mt-4 block">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editar incidente {incidente.folio}</h1>
          <Link href={`/incidentes/${id}`} className="text-cyan-400 hover:underline">
            ← Volver al detalle
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-900/30 p-3 text-sm text-green-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-300">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-slate-300">
                Tipo *
              </label>
              <input
                type="text"
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lugar" className="block text-sm font-medium text-slate-300">
              Lugar *
            </label>
            <input
              type="text"
              id="lugar"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="amenazasPresentes" className="block text-sm font-medium text-slate-300">
              Amenazas presentes
            </label>
            <input
              type="text"
              id="amenazasPresentes"
              value={amenazasPresentes}
              onChange={(e) => setAmenazasPresentes(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="areasAfectadas" className="block text-sm font-medium text-slate-300">
              Áreas afectadas
            </label>
            <input
              type="text"
              id="areasAfectadas"
              value={areasAfectadas}
              onChange={(e) => setAreasAfectadas(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="objetivoInicial" className="block text-sm font-medium text-slate-300">
              Objetivo inicial
            </label>
            <input
              type="text"
              id="objetivoInicial"
              value={objetivoInicial}
              onChange={(e) => setObjetivoInicial(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="ubicacionPc" className="block text-sm font-medium text-slate-300">
                Ubicación Puesto de Comando
              </label>
              <input
                type="text"
                id="ubicacionPc"
                value={ubicacionPc}
                onChange={(e) => setUbicacionPc(e.target.value)}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ubicacionAe" className="block text-sm font-medium text-slate-300">
                Ubicación Área de Espera
              </label>
              <input
                type="text"
                id="ubicacionAe"
                value={ubicacionAe}
                onChange={(e) => setUbicacionAe(e.target.value)}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="rutaIngreso" className="block text-sm font-medium text-slate-300">
                Ruta de ingreso
              </label>
              <input
                type="text"
                id="rutaIngreso"
                value={rutaIngreso}
                onChange={(e) => setRutaIngreso(e.target.value)}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="rutaEgreso" className="block text-sm font-medium text-slate-300">
                Ruta de egreso
              </label>
              <input
                type="text"
                id="rutaEgreso"
                value={rutaEgreso}
                onChange={(e) => setRutaEgreso(e.target.value)}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mensajeSeguridad" className="block text-sm font-medium text-slate-300">
              Mensaje de seguridad
            </label>
            <input
              type="text"
              id="mensajeSeguridad"
              value={mensajeSeguridad}
              onChange={(e) => setMensajeSeguridad(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="canalesComunicacion" className="block text-sm font-medium text-slate-300">
              Canales de comunicación
            </label>
            <input
              type="text"
              id="canalesComunicacion"
              value={canalesComunicacion}
              onChange={(e) => setCanalesComunicacion(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                saving
                  ? "cursor-not-allowed bg-slate-600"
                  : "bg-yellow-600 hover:bg-yellow-500"
              }`}
            >
              {saving ? "Guardando..." : "Actualizar incidente"}
            </button>
            <Link
              href={`/incidentes/${id}`}
              className="rounded bg-slate-700 px-6 py-2 text-sm font-medium text-white hover:bg-slate-600"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
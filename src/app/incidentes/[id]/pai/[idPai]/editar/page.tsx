"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PlanAccion {
  idPai: number;
  idIncidente: number;
  idPeriodo: number;
  objetivosOperacionales: string;
  estrategias: string | null;
  tacticas: string | null;
  recursosEnLugar: string | null;
  recursosPorSolicitar: string | null;
  mensajeSeguridad: string | null;
  pronosticoTiempo: string | null;
  nombreJefePlanificacion: string | null;
}

export default function EditarPAIPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const idPai = params.idPai as string;

  const [plan, setPlan] = useState<PlanAccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [objetivosOperacionales, setObjetivosOperacionales] = useState("");
  const [estrategias, setEstrategias] = useState("");
  const [tacticas, setTacticas] = useState("");
  const [recursosEnLugar, setRecursosEnLugar] = useState("");
  const [recursosPorSolicitar, setRecursosPorSolicitar] = useState("");
  const [mensajeSeguridad, setMensajeSeguridad] = useState("");
  const [pronosticoTiempo, setPronosticoTiempo] = useState("");
  const [nombreJefePlanificacion, setNombreJefePlanificacion] = useState("");

  useEffect(() => {
    if (id && idPai) {
      fetch(`/api/planes-accion/${idPai}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al cargar el plan");
          }
          return res.json();
        })
        .then((data) => {
          setPlan(data);
          setObjetivosOperacionales(data.objetivosOperacionales || "");
          setEstrategias(data.estrategias || "");
          setTacticas(data.tacticas || "");
          setRecursosEnLugar(data.recursosEnLugar || "");
          setRecursosPorSolicitar(data.recursosPorSolicitar || "");
          setMensajeSeguridad(data.mensajeSeguridad || "");
          setPronosticoTiempo(data.pronosticoTiempo || "");
          setNombreJefePlanificacion(data.nombreJefePlanificacion || "");
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, idPai]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCargando(true);

    const data = {
      objetivosOperacionales,
      estrategias,
      tacticas,
      recursosEnLugar,
      recursosPorSolicitar,
      mensajeSeguridad,
      pronosticoTiempo,
      nombreJefePlanificacion,
    };

    try {
      const res = await fetch(`/api/planes-accion/${idPai}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Plan de acción actualizado correctamente");
        setTimeout(() => {
          router.push(`/incidentes/${id}`);
        }, 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al actualizar el plan");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Cargando plan de acción...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Plan de acción no encontrado</p>
        <Link href={`/incidentes/${id}`} className="text-rojo hover:underline mt-4 block font-medium">
          Volver al detalle
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">Editar Plan de Acción</h1>
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
          <div>
            <label htmlFor="objetivosOperacionales" className="block text-sm font-medium text-gray-700">
              Objetivos operacionales *
            </label>
            <textarea
              id="objetivosOperacionales"
              value={objetivosOperacionales}
              onChange={(e) => setObjetivosOperacionales(e.target.value)}
              required
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            />
          </div>

          <div>
            <label htmlFor="estrategias" className="block text-sm font-medium text-gray-700">
              Estrategias
            </label>
            <textarea
              id="estrategias"
              value={estrategias}
              onChange={(e) => setEstrategias(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            />
          </div>

          <div>
            <label htmlFor="tacticas" className="block text-sm font-medium text-gray-700">
              Tácticas
            </label>
            <textarea
              id="tacticas"
              value={tacticas}
              onChange={(e) => setTacticas(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            />
          </div>

          <div>
            <label htmlFor="recursosEnLugar" className="block text-sm font-medium text-gray-700">
              Recursos en el lugar
            </label>
            <input
              type="text"
              id="recursosEnLugar"
              value={recursosEnLugar}
              onChange={(e) => setRecursosEnLugar(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            />
          </div>

          <div>
            <label htmlFor="recursosPorSolicitar" className="block text-sm font-medium text-gray-700">
              Recursos por solicitar
            </label>
            <input
              type="text"
              id="recursosPorSolicitar"
              value={recursosPorSolicitar}
              onChange={(e) => setRecursosPorSolicitar(e.target.value)}
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
            <label htmlFor="pronosticoTiempo" className="block text-sm font-medium text-gray-700">
              Pronóstico del tiempo
            </label>
            <input
              type="text"
              id="pronosticoTiempo"
              value={pronosticoTiempo}
              onChange={(e) => setPronosticoTiempo(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            />
          </div>

          <div>
            <label htmlFor="nombreJefePlanificacion" className="block text-sm font-medium text-gray-700">
              Nombre del Jefe de Planificación
            </label>
            <input
              type="text"
              id="nombreJefePlanificacion"
              value={nombreJefePlanificacion}
              onChange={(e) => setNombreJefePlanificacion(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                cargando
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-yellow-600 hover:bg-yellow-500"
              }`}
            >
              {cargando ? "Guardando..." : "Actualizar Plan de Acción"}
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
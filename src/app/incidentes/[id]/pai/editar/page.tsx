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
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Cargando plan de acción...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Plan de acción no encontrado</p>
        <Link href={`/incidentes/${id}`} className="text-cyan-400 hover:underline mt-4 block">
          Volver al detalle
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editar Plan de Acción</h1>
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
          <div>
            <label htmlFor="objetivosOperacionales" className="block text-sm font-medium text-slate-300">
              Objetivos operacionales *
            </label>
            <textarea
              id="objetivosOperacionales"
              value={objetivosOperacionales}
              onChange={(e) => setObjetivosOperacionales(e.target.value)}
              required
              rows={3}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="estrategias" className="block text-sm font-medium text-slate-300">
              Estrategias
            </label>
            <textarea
              id="estrategias"
              value={estrategias}
              onChange={(e) => setEstrategias(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="tacticas" className="block text-sm font-medium text-slate-300">
              Tácticas
            </label>
            <textarea
              id="tacticas"
              value={tacticas}
              onChange={(e) => setTacticas(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="recursosEnLugar" className="block text-sm font-medium text-slate-300">
              Recursos en el lugar
            </label>
            <input
              type="text"
              id="recursosEnLugar"
              value={recursosEnLugar}
              onChange={(e) => setRecursosEnLugar(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="recursosPorSolicitar" className="block text-sm font-medium text-slate-300">
              Recursos por solicitar
            </label>
            <input
              type="text"
              id="recursosPorSolicitar"
              value={recursosPorSolicitar}
              onChange={(e) => setRecursosPorSolicitar(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
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
            <label htmlFor="nombreJefePlanificacion" className="block text-sm font-medium text-slate-300">
              Nombre del Jefe de Planificación
            </label>
            <input
              type="text"
              id="nombreJefePlanificacion"
              value={nombreJefePlanificacion}
              onChange={(e) => setNombreJefePlanificacion(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                cargando
                  ? "cursor-not-allowed bg-slate-600"
                  : "bg-yellow-600 hover:bg-yellow-500"
              }`}
            >
              {cargando ? "Guardando..." : "Actualizar Plan de Acción"}
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
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PeriodoOperacional {
  idPeriodo: number;
  numeroPeriodo: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  observaciones: string | null;
}

export default function NuevoPAIPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [periodos, setPeriodos] = useState<PeriodoOperacional[]>([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [idPeriodo, setIdPeriodo] = useState("");
  const [objetivosOperacionales, setObjetivosOperacionales] = useState("");
  const [estrategias, setEstrategias] = useState("");
  const [tacticas, setTacticas] = useState("");
  const [recursosEnLugar, setRecursosEnLugar] = useState("");
  const [recursosPorSolicitar, setRecursosPorSolicitar] = useState("");
  const [mensajeSeguridad, setMensajeSeguridad] = useState("");
  const [nombreJefePlanificacion, setNombreJefePlanificacion] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`/api/periodos-operacionales?idIncidente=${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al cargar periodos");
          }
          return res.json();
        })
        .then((data) => {
          setPeriodos(data);
          setLoadingPeriodos(false);
          if (data.length > 0) {
            setIdPeriodo(String(data[data.length - 1].idPeriodo));
          }
        })
        .catch((err) => {
          setError(err.message);
          setLoadingPeriodos(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCargando(true);

    if (!idPeriodo) {
      setError("Debes seleccionar un periodo operacional");
      setCargando(false);
      return;
    }

    const data = {
      idIncidente: parseInt(id),
      idPeriodo: parseInt(idPeriodo),
      objetivosOperacionales,
      estrategias,
      tacticas,
      recursosEnLugar,
      recursosPorSolicitar,
      mensajeSeguridad,
      nombreJefePlanificacion,
    };

    try {
      const res = await fetch("/api/planes-accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Plan de acción creado correctamente");
        setTimeout(() => {
          router.push(`/incidentes/${id}`);
        }, 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al crear el plan de acción");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (loadingPeriodos) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Cargando periodos operacionales...</p>
      </div>
    );
  }

  if (periodos.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Nuevo Plan de Acción</h1>
            <Link href={`/incidentes/${id}`} className="text-cyan-400 hover:underline">
              ← Volver al detalle
            </Link>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="text-yellow-400">No hay periodos operacionales registrados para este incidente.</p>
            <p className="text-sm text-slate-400 mt-2">
              Debes registrar al menos un periodo operacional antes de crear un Plan de Acción.
            </p>
            <Link
              href={`/incidentes/${id}/periodos/nuevo`}
              className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Registrar periodo operacional
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nuevo Plan de Acción del Incidente</h1>
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
            <label htmlFor="idPeriodo" className="block text-sm font-medium text-slate-300">
              Periodo operacional *
            </label>
            <select
              id="idPeriodo"
              value={idPeriodo}
              onChange={(e) => setIdPeriodo(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Seleccionar periodo</option>
              {periodos.map((p) => (
                <option key={p.idPeriodo} value={p.idPeriodo}>
                  Periodo {p.numeroPeriodo} - {new Date(p.fechaHoraInicio).toLocaleString()} al{" "}
                  {new Date(p.fechaHoraFin).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

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
              placeholder="Ej: Contener el incendio en 2 horas y evacuar el área"
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
              placeholder="Ej: Atacar el fuego desde el norte con 2 líneas de mangueras"
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
              placeholder="Ej: Posicionar unidad 1 en entrada norte, unidad 2 en sur"
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
              placeholder="Ej: 2 ambulancias, 1 unidad de bomberos"
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
              placeholder="Ej: 1 unidad adicional de rescate"
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
              placeholder="Ej: Uso obligatorio de equipo completo"
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
              placeholder="Nombre del responsable"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                cargando
                  ? "cursor-not-allowed bg-slate-600"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {cargando ? "Guardando..." : "Crear Plan de Acción"}
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
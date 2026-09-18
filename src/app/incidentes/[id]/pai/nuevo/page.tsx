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
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Cargando periodos operacionales...</p>
      </div>
    );
  }

  if (periodos.length === 0) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-rojo">Nuevo Plan de Acción</h1>
            <Link href={`/incidentes/${id}`} className="text-rojo hover:underline font-medium">
              ← Volver al detalle
            </Link>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="font-medium text-yellow-800">
              No hay periodos operacionales registrados para este incidente.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Debes registrar al menos un periodo operacional antes de crear un Plan de Acción.
            </p>
            <Link
              href={`/incidentes/${id}/periodos/nuevo`}
              className="mt-4 inline-block rounded bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
            >
              Registrar periodo operacional
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">Nuevo Plan de Acción del Incidente</h1>
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
            <label htmlFor="idPeriodo" className="block text-sm font-medium text-gray-700">
              Periodo operacional *
            </label>
            <select
              id="idPeriodo"
              value={idPeriodo}
              onChange={(e) => setIdPeriodo(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
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
              placeholder="Ej: Contener el incendio en 2 horas y evacuar el área"
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
              placeholder="Ej: Atacar el fuego desde el norte con 2 líneas de mangueras"
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
              placeholder="Ej: Posicionar unidad 1 en entrada norte, unidad 2 en sur"
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
              placeholder="Ej: 2 ambulancias, 1 unidad de bomberos"
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
              placeholder="Ej: 1 unidad adicional de rescate"
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
              placeholder="Ej: Uso obligatorio de equipo completo"
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
              placeholder="Nombre del responsable"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                cargando
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-carbon hover:bg-carbon-oscuro"
              }`}
            >
              {cargando ? "Guardando..." : "Crear Plan de Acción"}
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
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoPeriodoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [numeroPeriodo, setNumeroPeriodo] = useState("1");
  const [fechaHoraInicio, setFechaHoraInicio] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [fechaHoraFin, setFechaHoraFin] = useState(
    new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [observaciones, setObservaciones] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCargando(true);

    const data = {
      idIncidente: parseInt(id),
      numeroPeriodo: parseInt(numeroPeriodo),
      fechaHoraInicio: new Date(fechaHoraInicio).toISOString(),
      fechaHoraFin: new Date(fechaHoraFin).toISOString(),
      observaciones,
    };

    try {
      const res = await fetch("/api/periodos-operacionales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Periodo operacional creado correctamente");
        setTimeout(() => {
          router.push(`/incidentes/${id}`);
        }, 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al crear el periodo");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nuevo Periodo Operacional</h1>
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
            <label htmlFor="numeroPeriodo" className="block text-sm font-medium text-slate-300">
              Número de periodo *
            </label>
            <input
              type="number"
              id="numeroPeriodo"
              value={numeroPeriodo}
              onChange={(e) => setNumeroPeriodo(e.target.value)}
              min="1"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="fechaHoraInicio" className="block text-sm font-medium text-slate-300">
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              id="fechaHoraInicio"
              value={fechaHoraInicio}
              onChange={(e) => setFechaHoraInicio(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="fechaHoraFin" className="block text-sm font-medium text-slate-300">
              Fecha y hora de fin *
            </label>
            <input
              type="datetime-local"
              id="fechaHoraFin"
              value={fechaHoraFin}
              onChange={(e) => setFechaHoraFin(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-slate-300">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Observaciones del periodo operacional"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                cargando
                  ? "cursor-not-allowed bg-slate-600"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {cargando ? "Guardando..." : "Crear Periodo"}
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
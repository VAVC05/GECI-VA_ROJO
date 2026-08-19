"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoIncidentePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      tipo: formData.get("tipo") as string,
      lugar: formData.get("lugar") as string,
      fechaHoraInicio: new Date(formData.get("fechaHoraInicio") as string).toISOString(),
    };

    try {
      const res = await fetch("/api/incidentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/incidentes");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al crear el incidente");
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
          <h1 className="text-2xl font-bold">Nuevo Incidente</h1>
          <Link href="/incidentes" className="text-cyan-400 hover:underline">
            ← Volver al listado
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-300">
              Nombre del incidente *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Incendio en el Mercado Central"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-slate-300">
              Tipo *
            </label>
            <input
              type="text"
              id="tipo"
              name="tipo"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: INCENDIO, RESCATE, PREHOSPITALARIO"
            />
          </div>

          <div>
            <label htmlFor="lugar" className="block text-sm font-medium text-slate-300">
              Lugar *
            </label>
            <input
              type="text"
              id="lugar"
              name="lugar"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Mercado Central, Metepec"
            />
          </div>

          <div>
            <label htmlFor="fechaHoraInicio" className="block text-sm font-medium text-slate-300">
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              id="fechaHoraInicio"
              name="fechaHoraInicio"
              required
              defaultValue={new Date().toISOString().slice(0, 16)}
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
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {cargando ? "Guardando..." : "Guardar incidente"}
            </button>
            <Link
              href="/incidentes"
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
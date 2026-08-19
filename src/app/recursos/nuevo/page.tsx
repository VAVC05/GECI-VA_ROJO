"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoRecursoPage() {
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
      clase: formData.get("clase") as string,
      tipo: formData.get("tipo") as string,
      institucion: (formData.get("institucion") as string) || undefined,
      matricula: (formData.get("matricula") as string) || undefined,
      numeroPersonas: parseInt(formData.get("numeroPersonas") as string) || undefined,
    };

    try {
      const res = await fetch("/api/recursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/recursos");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al crear el recurso");
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
          <h1 className="text-2xl font-bold">Nuevo Recurso</h1>
          <Link href="/recursos" className="text-cyan-400 hover:underline">
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
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Ambulancia UR-01"
            />
          </div>

          <div>
            <label htmlFor="clase" className="block text-sm font-medium text-slate-300">
              Clase *
            </label>
            <select
              id="clase"
              name="clase"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Seleccionar clase</option>
              <option value="PERSONAL">Personal</option>
              <option value="VEHICULO">Vehículo</option>
              <option value="EQUIPO">Equipo</option>
            </select>
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
              placeholder="Ej: AMBULANCIA, BOMBERO, EXTINTOR"
            />
          </div>

          <div>
            <label htmlFor="institucion" className="block text-sm font-medium text-slate-300">
              Institución
            </label>
            <input
              type="text"
              id="institucion"
              name="institucion"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Coordinación de Protección Civil"
            />
          </div>

          <div>
            <label htmlFor="matricula" className="block text-sm font-medium text-slate-300">
              Matrícula
            </label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: MTP-1234"
            />
          </div>

          <div>
            <label htmlFor="numeroPersonas" className="block text-sm font-medium text-slate-300">
              Número de personas
            </label>
            <input
              type="number"
              id="numeroPersonas"
              name="numeroPersonas"
              min="0"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="0"
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
              {cargando ? "Guardando..." : "Guardar recurso"}
            </button>
            <Link
              href="/recursos"
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
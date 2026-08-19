"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevaVictimaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      idIncidente: parseInt(id),
      nombrePaciente: (formData.get("nombrePaciente") as string) || undefined,
      sexo: formData.get("sexo") as string,
      edad: parseInt(formData.get("edad") as string) || undefined,
      lugarRegistro: formData.get("lugarRegistro") as string,
      notasAdicionales: (formData.get("notasAdicionales") as string) || undefined,
    };

    try {
      const res = await fetch("/api/victimas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push(`/incidentes/${id}`);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al registrar la víctima");
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
          <h1 className="text-2xl font-bold">Registrar nueva víctima</h1>
          <Link href={`/incidentes/${id}`} className="text-cyan-400 hover:underline">
            ← Volver al detalle
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div>
            <label htmlFor="nombrePaciente" className="block text-sm font-medium text-slate-300">
              Nombre del paciente
            </label>
            <input
              type="text"
              id="nombrePaciente"
              name="nombrePaciente"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Juan Pérez (opcional)"
            />
          </div>

          <div>
            <label htmlFor="sexo" className="block text-sm font-medium text-slate-300">
              Sexo *
            </label>
            <select
              id="sexo"
              name="sexo"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Seleccionar sexo</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="edad" className="block text-sm font-medium text-slate-300">
              Edad
            </label>
            <input
              type="number"
              id="edad"
              name="edad"
              min="0"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: 35"
            />
          </div>

          <div>
            <label htmlFor="lugarRegistro" className="block text-sm font-medium text-slate-300">
              Lugar de registro *
            </label>
            <select
              id="lugarRegistro"
              name="lugarRegistro"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Seleccionar lugar</option>
              <option value="ACV">ACV (Área de Concentración de Víctimas)</option>
              <option value="Unidad Médica">Unidad Médica</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="notasAdicionales" className="block text-sm font-medium text-slate-300">
              Notas adicionales
            </label>
            <textarea
              id="notasAdicionales"
              name="notasAdicionales"
              rows={3}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Información adicional sobre la víctima..."
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
              {cargando ? "Guardando..." : "Registrar víctima"}
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
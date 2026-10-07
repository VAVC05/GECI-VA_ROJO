"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ErrorCampo {
  nombre?: string;
  tipo?: string;
  lugar?: string;
  fechaHoraInicio?: string;
}

export default function NuevoIncidentePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState<ErrorCampo>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setErroresCampos({});
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
        return;
      }

      const errorData = await res.json();

      // Si el backend devuelve detalles por campo, se pintan debajo de cada input
      if (Array.isArray(errorData.details)) {
        const nuevosErrores: ErrorCampo = {};
        for (const detalle of errorData.details) {
          const campo = detalle.path?.[0] as keyof ErrorCampo;
          if (campo) {
            nuevosErrores[campo] = detalle.message;
          }
        }
        setErroresCampos(nuevosErrores);
      }

      // Mensaje general solo si no hay errores específicos por campo
      if (!Array.isArray(errorData.details) || errorData.details.length === 0) {
        setError(errorData.error || "Error al crear el incidente");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">Nuevo Incidente</h1>
          <Link href="/incidentes" className="text-rojo hover:underline font-medium">
            ← Volver al listado
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre del incidente *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className={`mt-1 w-full rounded border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
                erroresCampos.nombre
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-rojo focus:ring-rojo"
              }`}
              placeholder="Ej: Incendio en el Mercado Central"
            />
            {erroresCampos.nombre && (
              <p className="mt-1 text-xs text-red-600">{erroresCampos.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
              Tipo *
            </label>
            <input
              type="text"
              id="tipo"
              name="tipo"
              required
              className={`mt-1 w-full rounded border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
                erroresCampos.tipo
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-rojo focus:ring-rojo"
              }`}
              placeholder="Ej: INCENDIO, RESCATE, PREHOSPITALARIO"
            />
            {erroresCampos.tipo && (
              <p className="mt-1 text-xs text-red-600">{erroresCampos.tipo}</p>
            )}
          </div>

          <div>
            <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">
              Lugar *
            </label>
            <input
              type="text"
              id="lugar"
              name="lugar"
              required
              className={`mt-1 w-full rounded border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
                erroresCampos.lugar
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-rojo focus:ring-rojo"
              }`}
              placeholder="Ej: Mercado Central, Metepec"
            />
            {erroresCampos.lugar && (
              <p className="mt-1 text-xs text-red-600">{erroresCampos.lugar}</p>
            )}
          </div>

          <div>
            <label htmlFor="fechaHoraInicio" className="block text-sm font-medium text-gray-700">
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              id="fechaHoraInicio"
              name="fechaHoraInicio"
              required
              defaultValue={new Date().toISOString().slice(0, 16)}
              className={`mt-1 w-full rounded border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
                erroresCampos.fechaHoraInicio
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-rojo focus:ring-rojo"
              }`}
            />
            {erroresCampos.fechaHoraInicio && (
              <p className="mt-1 text-xs text-red-600">{erroresCampos.fechaHoraInicio}</p>
            )}
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
              {cargando ? "Guardando..." : "Guardar incidente"}
            </button>
            <Link
              href="/incidentes"
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
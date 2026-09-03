"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Recurso {
  idRecurso: number;
  nombre: string;
  clase: string;
  tipo: string;
  estado: "DISPONIBLE" | "ASIGNADO" | "NO_DISPONIBLE";
}

interface IncidenteBasico {
  idIncidente: number;
   folio: string;
  nombre: string;
   tipo: string;
   lugar: string;
  estado: "ACTIVO" | "CERRADO";
}

export default function AsignarRecursoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [incidente, setIncidente] = useState<IncidenteBasico | null>(null);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      // Cargar incidente
      const resIncidente = await fetch(`/api/incidentes/${id}`);
      if (!resIncidente.ok) throw new Error("Error al cargar incidente");
      const dataIncidente = await resIncidente.json();
      setIncidente(dataIncidente);

      // Cargar recursos disponibles
      const resRecursos = await fetch("/api/recursos?estado=DISPONIBLE");
      if (!resRecursos.ok) throw new Error("Error al cargar recursos");
      const dataRecursos = await resRecursos.json();
      setRecursos(dataRecursos.recursos || []);
    } catch (error) {
      setError("Error al cargar los datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async (idRecurso: number) => {
    setAsignando(true);
    setError("");
    setExito("");

    try {
      const res = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idIncidente: parseInt(id),
          idRecurso,
          tareaAsignada: "Asignado desde la interfaz",
          ubicacionAsignacion: incidente?.lugar || "No especificada",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al asignar recurso");
      }

      setExito("✅ Recurso asignado correctamente");
      // Recargar recursos disponibles
      await cargarDatos();
    } catch (error: any) {
      setError(error.message || "Error al asignar recurso");
    } finally {
      setAsignando(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gris text-gray-900 p-6">
        <p>Cargando...</p>
      </main>
    );
  }

  if (!incidente) {
    return (
      <main className="min-h-screen bg-gris text-gray-900 p-6">
        <p className="text-red-400">Incidente no encontrado</p>
        <Link href="/incidentes" className="text-rojo hover:underline mt-4 block font-medium">
          Volver al listado
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gris text-gray-900 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/incidentes/${id}`}
          className="text-rojo hover:underline block mb-4 font-medium"
        >
          ← Volver al detalle del incidente
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-rojo">Asignar recurso</h1>
          <p className="text-sm text-gray-500 mt-1">
            Incidente: {incidente.folio} - {incidente.nombre}
          </p>

          {error && (
            <div className="mt-4 rounded bg-red-900/30 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {exito && (
            <div className="mt-4 rounded bg-green-900/30 p-3 text-sm text-green-300">
              {exito}
            </div>
          )}

          {recursos.length === 0 ? (
            <div className="mt-6 rounded border border-yellow-800 bg-yellow-950 p-4 text-yellow-300">
              <p>No hay recursos disponibles en este momento.</p>
              <Link
                href="/recursos/nuevo"
                className="text-rojo hover:underline block mt-2 font-medium"
              >
                → Registrar nuevo recurso
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Clase
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recursos.map((recurso) => (
                    <tr key={recurso.idRecurso} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {recurso.nombre}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {recurso.clase}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {recurso.tipo}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <button
                          onClick={() => handleAsignar(recurso.idRecurso)}
                          disabled={asignando}
                          className="rounded bg-carbon px-3 py-1 text-xs font-medium text-white hover:bg-carbon-oscuro disabled:bg-gray-400"
                        >
                          {asignando ? "Asignando..." : "Asignar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
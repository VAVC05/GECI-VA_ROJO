"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Incidente {
  idIncidente: number;
  folio: string;
  nombre: string;
  tipo: string;
  lugar: string;
  estado: "ACTIVO" | "CERRADO";
  fechaHoraInicio: string;
  fechaHoraCierre: string | null;
  usuarioRegistro: {
    nombreCompleto: string;
    correo: string;
  };
  observacionesCierre: string | null;
}

export default function DetalleIncidentePage() {
  const params = useParams();
  const id = params.id as string;

  const [incidente, setIncidente] = useState<Incidente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`/api/incidentes/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al obtener detalle");
          }
          return res.json();
        })
        .then((data) => setIncidente(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <p>Cargando detalle...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <p className="text-red-400">Error: {error}</p>
        <Link href="/incidentes" className="text-blue-400 hover:underline mt-4 block">
          Volver al listado
        </Link>
      </main>
    );
  }

  if (!incidente) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <p>Incidente no encontrado</p>
        <Link href="/incidentes" className="text-blue-400 hover:underline mt-4 block">
          Volver al listado
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/incidentes" className="text-blue-400 hover:underline block mb-4">
          ← Volver al listado
        </Link>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">{incidente.nombre}</h1>
          <p className="text-sm text-slate-400 mt-1">Folio: {incidente.folio}</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Estado</p>
              <p className="font-medium">{incidente.estado}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Tipo</p>
              <p>{incidente.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Lugar</p>
              <p>{incidente.lugar}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Fecha de inicio</p>
              <p>{new Date(incidente.fechaHoraInicio).toLocaleString()}</p>
            </div>
            {incidente.fechaHoraCierre && (
              <div>
                <p className="text-sm text-slate-400">Fecha de cierre</p>
                <p>{new Date(incidente.fechaHoraCierre).toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-400">Registrado por</p>
              <p>{incidente.usuarioRegistro?.nombreCompleto}</p>
            </div>
          </div>

          {incidente.estado === "CERRADO" && incidente.observacionesCierre && (
            <div className="mt-4 rounded border border-red-800 bg-red-950 p-3">
              <p className="text-sm text-slate-400">Observaciones de cierre</p>
              <p className="text-sm">{incidente.observacionesCierre}</p>
            </div>
          )}

          {/* ✅ SECCIÓN DE BOTONES DE ACCIÓN - AQUÍ AGREGAMOS "ASIGNAR RECURSO" */}
          <div className="mt-6 flex gap-3">
            {incidente.estado === "ACTIVO" && (
              <>
                <Link
                  href={`/incidentes/${incidente.idIncidente}/editar`}
                  className="rounded bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-500"
                >
                  Editar
                </Link>
                <Link
                  href={`/incidentes/${incidente.idIncidente}/asignar`}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                >
                  Asignar recurso
                </Link>
              </>
            )}
            <Link
              href="/incidentes"
              className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
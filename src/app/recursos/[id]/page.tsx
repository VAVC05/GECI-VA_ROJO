"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Asignacion {
  idAsignacion: number;
  fechaHoraAsignacion: string;
  fechaHoraDesmovilizacion: string | null;
  tareaAsignada: string | null;
  ubicacionAsignacion: string | null;
  observacionesDesmovilizacion: string | null;
  incidente: {
    idIncidente: number;
    folio: string;
    nombre: string;
  };
  usuarioAsigno: {
    nombreCompleto: string;
  };
}

interface Recurso {
  idRecurso: number;
  nombre: string;
  clase: string;
  tipo: string;
  institucion: string | null;
  matricula: string | null;
  numeroPersonas: number | null;
  estado: "DISPONIBLE" | "ASIGNADO" | "NO_DISPONIBLE";
  asignaciones: Asignacion[];
}

export default function DetalleRecursoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDetalle();
    }
  }, [id]);

  const fetchDetalle = async () => {
    try {
      const res = await fetch(`/api/recursos/${id}`);
      if (!res.ok) throw new Error("Error al obtener detalle");
      const data = await res.json();
      setRecurso(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <p>Cargando detalle...</p>
      </main>
    );
  }

  if (!recurso) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <p>Recurso no encontrado</p>
        <Link href="/recursos" className="text-blue-400 hover:underline">
          Volver al listado
        </Link>
      </main>
    );
  }

  const asignacionActiva = recurso.asignaciones.find(
    (a) => a.fechaHoraDesmovilizacion === null
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/recursos" className="text-blue-400 hover:underline block mb-4">
          ← Volver al listado
        </Link>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">{recurso.nombre}</h1>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Clase</p>
              <p>{recurso.clase}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Tipo</p>
              <p>{recurso.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Institución</p>
              <p>{recurso.institucion || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Matrícula</p>
              <p>{recurso.matricula || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Número de personas</p>
              <p>{recurso.numeroPersonas ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Estado</p>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  recurso.estado === "DISPONIBLE"
                    ? "bg-green-900/30 text-green-300"
                    : recurso.estado === "ASIGNADO"
                    ? "bg-yellow-900/30 text-yellow-300"
                    : "bg-red-900/30 text-red-300"
                }`}
              >
                {recurso.estado}
              </span>
            </div>
          </div>

          {asignacionActiva && (
            <div className="mt-4 rounded border border-yellow-800 bg-yellow-950 p-3">
              <p className="text-sm text-yellow-400">Asignado al incidente:</p>
              <Link
                href={`/incidentes/${asignacionActiva.incidente.idIncidente}`}
                className="text-cyan-400 hover:underline"
              >
                {asignacionActiva.incidente.folio} - {asignacionActiva.incidente.nombre}
              </Link>
              <p className="text-sm text-slate-400 mt-1">
                Tarea: {asignacionActiva.tareaAsignada || "Sin asignar"}
              </p>
            </div>
          )}

          {recurso.asignaciones.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Historial de asignaciones</h2>
              <div className="mt-2 space-y-2">
                {recurso.asignaciones.map((asignacion) => (
                  <div
                    key={asignacion.idAsignacion}
                    className="rounded border border-slate-700 bg-slate-800 p-3 text-sm"
                  >
                    <p>
                      <span className="text-slate-400">Incidente:</span>{" "}
                      <Link
                        href={`/incidentes/${asignacion.incidente.idIncidente}`}
                        className="text-cyan-400 hover:underline"
                      >
                        {asignacion.incidente.folio}
                      </Link>
                    </p>
                    <p>
                      <span className="text-slate-400">Asignado:</span>{" "}
                      {new Date(asignacion.fechaHoraAsignacion).toLocaleString()}
                    </p>
                    {asignacion.fechaHoraDesmovilizacion && (
                      <p>
                        <span className="text-slate-400">Desmovilizado:</span>{" "}
                        {new Date(asignacion.fechaHoraDesmovilizacion).toLocaleString()}
                      </p>
                    )}
                    {asignacion.observacionesDesmovilizacion && (
                      <p className="text-slate-400">
                        Observaciones: {asignacion.observacionesDesmovilizacion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
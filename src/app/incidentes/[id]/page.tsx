"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BotonGenerarPDF from "@/components/BotonGenerarPDF";

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
  victimas?: any[];
  asignacionesRecurso?: any[];
}

export default function DetalleIncidentePage() {
  const params = useParams();
  const id = params.id as string;

  const [incidente, setIncidente] = useState<Incidente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarDetalle = () => {
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
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const handleClasificar = async (victimaId: number) => {
    const color = prompt("Clasificación (ROJO, AMARILLO, VERDE, NEGRO):");
    if (color && ["ROJO", "AMARILLO", "VERDE", "NEGRO"].includes(color)) {
      const res = await fetch(`/api/victimas/${victimaId}/triage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clasificacion: color }),
      });
      if (res.ok) {
        cargarDetalle(); // Recarga los datos sin recargar la página completa
      } else {
        alert("Error al clasificar");
      }
    }
  };

  const handleTrasladar = async (victimaId: number) => {
    const hospital = prompt("Centro hospitalario:");
    if (hospital) {
      const res = await fetch(`/api/victimas/${victimaId}/traslado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centroHospitalario: hospital }),
      });
      if (res.ok) {
        cargarDetalle();
      } else {
        alert("Error al registrar traslado");
      }
    }
  };

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
      <div className="mx-auto max-w-6xl">
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

          {/* 🆕 TABLA DE VÍCTIMAS - CORREGIDA Y COMPACTA */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Víctimas registradas</h2>
            {incidente.victimas && incidente.victimas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700 text-sm">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                        Nombre
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                        Sexo
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                        Edad
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                        Triage
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                        Estado
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                        Observaciones
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {incidente.victimas.map((victima: any) => {
                      const ultimoTriage = victima.historialTriage?.[0]?.clasificacion || "Sin clasificar";
                      return (
                        <tr key={victima.idVictima} className="hover:bg-slate-800/30">
                          <td className="px-2 py-1.5 text-xs">{victima.nombrePaciente || "No identificado"}</td>
                          <td className="px-2 py-1.5 text-xs">{victima.sexo || "N/A"}</td>
                          <td className="px-2 py-1.5 text-xs">{victima.edad || "?"}</td>
                          <td className="px-2 py-1.5 text-xs">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                ultimoTriage === "ROJO"
                                  ? "bg-red-900/30 text-red-300"
                                  : ultimoTriage === "AMARILLO"
                                  ? "bg-yellow-900/30 text-yellow-300"
                                  : ultimoTriage === "VERDE"
                                  ? "bg-green-900/30 text-green-300"
                                  : ultimoTriage === "NEGRO"
                                  ? "bg-gray-900/30 text-gray-300"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {ultimoTriage}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-xs">{victima.estadoAtencion}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-400 max-w-xs truncate">
                            {victima.notasAdicionales || "—"}
                          </td>
                          <td className="px-2 py-1.5 text-xs">
                            <div className="flex flex-wrap gap-1">
                              {victima.estadoAtencion !== "TRASLADADO" && (
                                <button
                                  onClick={() => handleClasificar(victima.idVictima)}
                                  className="rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-purple-500 whitespace-nowrap"
                                >
                                  Clasificar
                                </button>
                              )}
                              {victima.estadoAtencion !== "TRASLADADO" && (
                                <button
                                  onClick={() => handleTrasladar(victima.idVictima)}
                                  className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-blue-500 whitespace-nowrap"
                                >
                                  Trasladar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No hay víctimas registradas en este incidente.</p>
            )}
          </div>

          {/* ✅ BOTONES DE ACCIÓN */}
          <div className="mt-6 flex gap-3 flex-wrap">
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
                <Link
                  href={`/incidentes/${incidente.idIncidente}/victimas/nueva`}
                  className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
                >
                  Registrar víctima
                </Link>
              </>
            )}

            <BotonGenerarPDF incidente={incidente} />

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
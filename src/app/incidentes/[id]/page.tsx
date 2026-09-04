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
  amenazasPresentes: string | null;
  areasAfectadas: string | null;
  objetivoInicial: string | null;
  ubicacionPc: string | null;
  ubicacionAe: string | null;
  rutaIngreso: string | null;
  rutaEgreso: string | null;
  mensajeSeguridad: string | null;
  canalesComunicacion: string | null;
  organizacionSCI?: any[];
  planComunicaciones?: any;
  planMedico?: any;
  victimas?: any[];
  asignacionesRecurso?: any[];
  periodosOperacionales?: any[];
  planesAccion?: any[];
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
        .then((data) => {
          setIncidente(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gris text-gray-900 p-6">
        <p>Cargando detalle...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gris text-gray-900 p-6">
        <p className="text-red-600">Error: {error}</p>
        <Link href="/incidentes" className="text-rojo hover:underline mt-4 block font-medium">
          Volver al listado
        </Link>
      </main>
    );
  }

  if (!incidente) {
    return (
      <main className="min-h-screen bg-gris text-gray-900 p-6">
        <p>Incidente no encontrado</p>
        <Link href="/incidentes" className="text-rojo hover:underline mt-4 block font-medium">
          Volver al listado
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gris text-gray-900 p-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/incidentes" className="text-rojo hover:underline block mb-4 font-medium">
          ← Volver al listado
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-rojo">{incidente.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">Folio: {incidente.folio}</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-medium">{incidente.estado}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <p>{incidente.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lugar</p>
              <p>{incidente.lugar}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de inicio</p>
              <p>{new Date(incidente.fechaHoraInicio).toLocaleString()}</p>
            </div>
            {incidente.fechaHoraCierre && (
              <div>
                <p className="text-sm text-gray-500">Fecha de cierre</p>
                <p>{new Date(incidente.fechaHoraCierre).toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Registrado por</p>
              <p>{incidente.usuarioRegistro?.nombreCompleto}</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Información adicional</h3>
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              {incidente.amenazasPresentes && (
                <div>
                  <span className="text-gray-500">Amenazas presentes:</span>{" "}
                  <span>{incidente.amenazasPresentes}</span>
                </div>
              )}
              {incidente.areasAfectadas && (
                <div>
                  <span className="text-gray-500">Áreas afectadas:</span>{" "}
                  <span>{incidente.areasAfectadas}</span>
                </div>
              )}
              {incidente.objetivoInicial && (
                <div>
                  <span className="text-gray-500">Objetivo inicial:</span>{" "}
                  <span>{incidente.objetivoInicial}</span>
                </div>
              )}
              {incidente.ubicacionPc && (
                <div>
                  <span className="text-gray-500">Ubicación Puesto de Comando:</span>{" "}
                  <span>{incidente.ubicacionPc}</span>
                </div>
              )}
              {incidente.ubicacionAe && (
                <div>
                  <span className="text-gray-500">Ubicación Área de Espera:</span>{" "}
                  <span>{incidente.ubicacionAe}</span>
                </div>
              )}
              {incidente.rutaIngreso && (
                <div>
                  <span className="text-gray-500">Ruta de ingreso:</span>{" "}
                  <span>{incidente.rutaIngreso}</span>
                </div>
              )}
              {incidente.rutaEgreso && (
                <div>
                  <span className="text-gray-500">Ruta de egreso:</span>{" "}
                  <span>{incidente.rutaEgreso}</span>
                </div>
              )}
              {incidente.mensajeSeguridad && (
                <div>
                  <span className="text-gray-500">Mensaje de seguridad:</span>{" "}
                  <span>{incidente.mensajeSeguridad}</span>
                </div>
              )}
              {incidente.canalesComunicacion && (
                <div>
                  <span className="text-gray-500">Canales de comunicación:</span>{" "}
                  <span>{incidente.canalesComunicacion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Organización del SCI (organigrama con formato árbol) */}
          {incidente.organizacionSCI && incidente.organizacionSCI.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Organización de la Emergencia (SCI)</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="font-mono text-sm text-gray-800">
                  {incidente.organizacionSCI.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-gray-400">{idx === 0 ? "└──" : "├──"}</span>
                      <span className="font-medium">{item.rol}:</span>
                      <span>{item.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCI-205 Plan de Comunicaciones */}
          {incidente.planComunicaciones && (incidente.planComunicaciones.sistema || incidente.planComunicaciones.canales || incidente.planComunicaciones.equipos) && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">SCI-205 - Plan de Comunicaciones</h3>
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3 bg-gray-50 p-3 rounded border border-gray-200">
                {incidente.planComunicaciones.sistema && (
                  <div><span className="text-gray-500">Sistema/Equipo:</span> <span>{incidente.planComunicaciones.sistema}</span></div>
                )}
                {incidente.planComunicaciones.canales && (
                  <div><span className="text-gray-500">Canales/Frecuencias:</span> <span>{incidente.planComunicaciones.canales}</span></div>
                )}
                {incidente.planComunicaciones.equipos && (
                  <div><span className="text-gray-500">Equipos disponibles:</span> <span>{incidente.planComunicaciones.equipos}</span></div>
                )}
              </div>
            </div>
          )}

          {/* SCI-206 Plan Médico */}
          {incidente.planMedico && (incidente.planMedico.instalaciones || incidente.planMedico.hospitales || incidente.planMedico.personal) && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">SCI-206 - Plan Médico</h3>
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3 bg-gray-50 p-3 rounded border border-gray-200">
                {incidente.planMedico.instalaciones && (
                  <div><span className="text-gray-500">Instalaciones médicas:</span> <span>{incidente.planMedico.instalaciones}</span></div>
                )}
                {incidente.planMedico.hospitales && (
                  <div><span className="text-gray-500">Hospitales de derivación:</span> <span>{incidente.planMedico.hospitales}</span></div>
                )}
                {incidente.planMedico.personal && (
                  <div><span className="text-gray-500">Personal médico:</span> <span>{incidente.planMedico.personal}</span></div>
                )}
              </div>
            </div>
          )}

          {incidente.estado === "CERRADO" && incidente.observacionesCierre && (
            <div className="mt-4 rounded border border-red-800 bg-red-50 p-3">
              <p className="text-sm text-gray-500">Observaciones de cierre</p>
              <p className="text-sm">{incidente.observacionesCierre}</p>
            </div>
          )}

          {/* Periodos operacionales */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Periodos Operacionales</h2>
              {incidente.estado === "ACTIVO" && (
                <Link
                  href={`/incidentes/${incidente.idIncidente}/periodos/nuevo`}
                  className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  + Agregar periodo
                </Link>
              )}
            </div>

            {incidente.periodosOperacionales && incidente.periodosOperacionales.length > 0 ? (
              <div className="mt-3 space-y-2">
                {incidente.periodosOperacionales.map((periodo: any) => (
                  <div
                    key={periodo.idPeriodo}
                    className="rounded border border-gray-200 bg-gray-50 p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-indigo-600">
                        Periodo {periodo.numeroPeriodo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(periodo.fechaHoraInicio).toLocaleString()} - {new Date(periodo.fechaHoraFin).toLocaleString()}
                      </p>
                      {periodo.observaciones && (
                        <p className="text-xs text-gray-500 mt-1">{periodo.observaciones}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (confirm("¿Eliminar este periodo operacional?")) {
                            const res = await fetch(`/api/periodos-operacionales/${periodo.idPeriodo}`, {
                              method: "DELETE",
                            });
                            if (res.ok) {
                              cargarDetalle();
                            } else {
                              alert("Error al eliminar el periodo");
                            }
                          }
                        }}
                        className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                No hay periodos operacionales registrados.
                {incidente.estado === "ACTIVO" && (
                  <span>
                    {" "}
                    <Link
                      href={`/incidentes/${incidente.idIncidente}/periodos/nuevo`}
                      className="text-indigo-600 hover:underline"
                    >
                      Agrega el primero
                    </Link>
                    .
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Plan de Acción */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Plan de Acción del Incidente</h2>
              {incidente.estado === "ACTIVO" && (
                <Link
                  href={`/incidentes/${incidente.idIncidente}/pai/nuevo`}
                  className="rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-500"
                >
                  + Crear Plan de Acción
                </Link>
              )}
            </div>

            {incidente.planesAccion && incidente.planesAccion.length > 0 ? (
              <div className="mt-3 space-y-3">
                {incidente.planesAccion.map((plan: any) => (
                  <div
                    key={plan.idPai}
                    className="rounded border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">
                          Periodo {plan.periodo?.numeroPeriodo || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="text-gray-400">Preparado:</span>{" "}
                          {new Date(plan.fechaHoraPreparacion).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/incidentes/${incidente.idIncidente}/pai/${plan.idPai}/editar`}
                          className="rounded bg-yellow-600 px-2 py-1 text-xs font-medium text-white hover:bg-yellow-500"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm("¿Eliminar este plan de acción?")) {
                              const res = await fetch(`/api/planes-accion/${plan.idPai}`, {
                                method: "DELETE",
                              });
                              if (res.ok) {
                                cargarDetalle();
                              } else {
                                alert("Error al eliminar el plan");
                              }
                            }
                          }}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-gray-500">Objetivos:</span>{" "}
                        <span>{plan.objetivosOperacionales}</span>
                      </div>
                      {plan.estrategias && (
                        <div>
                          <span className="text-gray-500">Estrategias:</span>{" "}
                          <span>{plan.estrategias}</span>
                        </div>
                      )}
                      {plan.tacticas && (
                        <div>
                          <span className="text-gray-500">Tácticas:</span>{" "}
                          <span>{plan.tacticas}</span>
                        </div>
                      )}
                      {plan.recursosEnLugar && (
                        <div>
                          <span className="text-gray-500">Recursos en lugar:</span>{" "}
                          <span>{plan.recursosEnLugar}</span>
                        </div>
                      )}
                      {plan.recursosPorSolicitar && (
                        <div>
                          <span className="text-gray-500">Recursos por solicitar:</span>{" "}
                          <span>{plan.recursosPorSolicitar}</span>
                        </div>
                      )}
                      {plan.mensajeSeguridad && (
                        <div>
                          <span className="text-gray-500">Mensaje de seguridad:</span>{" "}
                          <span>{plan.mensajeSeguridad}</span>
                        </div>
                      )}
                      {plan.nombreJefePlanificacion && (
                        <div>
                          <span className="text-gray-500">Jefe Planificación:</span>{" "}
                          <span>{plan.nombreJefePlanificacion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                No hay planes de acción registrados para este incidente.
                {incidente.estado === "ACTIVO" && (
                  <span>
                    {" "}
                    <Link
                      href={`/incidentes/${incidente.idIncidente}/pai/nuevo`}
                      className="text-purple-600 hover:underline"
                    >
                      Crea el primero
                    </Link>
                    .
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Víctimas */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Víctimas registradas</h2>
            {incidente.victimas && incidente.victimas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Nombre
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Sexo
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Edad
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Triage
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Estado
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Hospital
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Observaciones
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incidente.victimas.map((victima: any) => {
                      const ultimoTriage = victima.historialTriage?.[0]?.clasificacion || "Sin clasificar";
                      return (
                        <tr key={victima.idVictima} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-xs">{victima.nombrePaciente || "No identificado"}</td>
                          <td className="px-2 py-1.5 text-xs">{victima.sexo || "N/A"}</td>
                          <td className="px-2 py-1.5 text-xs">{victima.edad || "?"}</td>
                          <td className="px-2 py-1.5 text-xs">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                ultimoTriage === "ROJO"
                                  ? "bg-red-100 text-red-800"
                                  : ultimoTriage === "AMARILLO"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ultimoTriage === "VERDE"
                                  ? "bg-green-100 text-green-800"
                                  : ultimoTriage === "NEGRO"
                                  ? "bg-gray-800 text-gray-100"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {ultimoTriage}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-xs">{victima.estadoAtencion}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-500">
                            {victima.centroHospitalario || "—"}
                          </td>
                          <td className="px-2 py-1.5 text-xs text-gray-500 max-w-xs truncate">
                            {victima.notasAdicionales || "—"}
                          </td>
                          <td className="px-2 py-1.5 text-xs">
                            <div className="flex flex-wrap gap-1">
                              <Link
                                href={`/incidentes/${id}/victimas/${victima.idVictima}/editar`}
                                className="rounded bg-gray-400 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-gray-500 whitespace-nowrap"
                              >
                                Editar
                              </Link>

                              <button
                                onClick={async () => {
                                  const colorActual = ultimoTriage !== "Sin clasificar" ? ultimoTriage : "ninguno";
                                  const msg = `Clasificación actual: ${colorActual}\nNuevo color (ROJO, AMARILLO, VERDE, NEGRO):`;
                                  const color = prompt(msg);
                                  if (color && ["ROJO", "AMARILLO", "VERDE", "NEGRO"].includes(color)) {
                                    const res = await fetch(`/api/victimas/${victima.idVictima}/triage`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ clasificacion: color }),
                                    });
                                    if (res.ok) {
                                      cargarDetalle();
                                    } else {
                                      alert("Error al clasificar");
                                    }
                                  }
                                }}
                                className="rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-purple-500 whitespace-nowrap"
                              >
                                {victima.historialTriage?.length > 0 ? "Reclasificar" : "Clasificar"}
                              </button>

                              {victima.estadoAtencion !== "TRASLADADO" && (
                                <button
                                  onClick={async () => {
                                    const hospital = prompt("Centro hospitalario:");
                                    if (hospital) {
                                      const res = await fetch(`/api/victimas/${victima.idVictima}/traslado`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ centroHospitalario: hospital }),
                                      });
                                      if (res.ok) cargarDetalle();
                                      else alert("Error al registrar traslado");
                                    }
                                  }}
                                  className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-blue-500 whitespace-nowrap"
                                >
                                  Trasladar
                                </button>
                              )}

                              <button
                                onClick={async () => {
                                  if (confirm(`¿Eliminar a "${victima.nombrePaciente || 'esta víctima'}"?`)) {
                                    const res = await fetch(`/api/victimas/${victima.idVictima}`, {
                                      method: "DELETE",
                                    });
                                    if (res.ok) cargarDetalle();
                                    else alert("Error al eliminar");
                                  }
                                }}
                                className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-500 whitespace-nowrap"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay víctimas registradas en este incidente.</p>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
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
                <Link
                  href={`/incidentes/${incidente.idIncidente}/pai/nuevo`}
                  className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
                >
                  Plan de Acción
                </Link>
              </>
            )}

            <BotonGenerarPDF incidente={incidente} />

            <Link
              href="/incidentes"
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
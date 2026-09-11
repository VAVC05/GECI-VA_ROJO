"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
    const id = params.id as string;

    const [recurso, setRecurso] = useState<Recurso | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let activo = true;

        const cargar = async () => {
            try {
                const res = await fetch(`/api/recursos/${id}`);
                if (!res.ok) throw new Error("Error al obtener detalle");
                const data: Recurso = await res.json();
                if (activo) setRecurso(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                if (activo) setLoading(false);
            }
        };

        cargar();

        return () => {
            activo = false;
        };
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gris text-gray-900 p-6">
                <p>Cargando detalle...</p>
            </main>
        );
    }

    if (!recurso) {
        return (
            <main className="min-h-screen bg-gris text-gray-900 p-6">
                <p>Recurso no encontrado</p>
                <Link href="/recursos" className="text-rojo hover:underline font-medium">
                    Volver al listado
                </Link>
            </main>
        );
    }

    const asignacionActiva = recurso.asignaciones.find(
        (a) => a.fechaHoraDesmovilizacion === null
    );

    return (
        <main className="min-h-screen bg-gris text-gray-900 p-6">
            <div className="mx-auto max-w-4xl">
                <Link
                    href="/recursos"
                    className="text-rojo hover:underline block mb-4 font-medium"
                >
                    ← Volver al listado
                </Link>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-rojo">{recurso.nombre}</h1>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Clase</p>
                            <p>{recurso.clase}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tipo</p>
                            <p>{recurso.tipo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Institución</p>
                            <p>{recurso.institucion || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Matrícula</p>
                            <p>{recurso.matricula || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Número de personas</p>
                            <p>{recurso.numeroPersonas ?? "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${recurso.estado === "DISPONIBLE"
                                        ? "bg-green-100 text-green-800"
                                        : recurso.estado === "ASIGNADO"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {recurso.estado}
                            </span>
                        </div>
                    </div>

                    {asignacionActiva && (
                        <div className="mt-4 rounded border border-yellow-800 bg-yellow-950 p-3">
                            <p className="text-sm text-yellow-700">Asignado al incidente:</p>
                            <Link
                                href={`/incidentes/${asignacionActiva.incidente.idIncidente}`}
                                className="text-rojo hover:underline font-medium"
                            >
                                {asignacionActiva.incidente.folio} -{" "}
                                {asignacionActiva.incidente.nombre}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                                Tarea: {asignacionActiva.tareaAsignada || "Sin asignar"}
                            </p>
                        </div>
                    )}

                    {recurso.asignaciones.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold">
                                Historial de asignaciones
                            </h2>
                            <div className="mt-2 space-y-2">
                                {recurso.asignaciones.map((asignacion) => (
                                    <div
                                        key={asignacion.idAsignacion}
                                        className="rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-800"
                                    >
                                        <p>
                                            <span className="text-gray-500">Incidente:</span>{" "}
                                            <Link
                                                href={`/incidentes/${asignacion.incidente.idIncidente}`}
                                                className="text-rojo hover:underline font-medium"
                                            >
                                                {asignacion.incidente.folio}
                                            </Link>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">Asignado:</span>{" "}
                                            {new Date(
                                                asignacion.fechaHoraAsignacion
                                            ).toLocaleString()}
                                        </p>
                                        {asignacion.fechaHoraDesmovilizacion && (
                                            <p>
                                                <span className="text-gray-500">Desmovilizado:</span>{" "}
                                                {new Date(
                                                    asignacion.fechaHoraDesmovilizacion
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                        {asignacion.observacionesDesmovilizacion && (
                                            <p className="text-gray-500">
                                                Observaciones:{" "}
                                                {asignacion.observacionesDesmovilizacion}
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
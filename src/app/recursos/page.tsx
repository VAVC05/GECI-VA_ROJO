import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import BotonDesmovilizar from "@/components/BotonDesmovilizar";

type RecursoConAsignaciones = Prisma.RecursoGetPayload<{
    include: {
        asignaciones: {
            include: {
                incidente: {
                    select: { idIncidente: true; folio: true; nombre: true };
                };
            };
        };
    };
}>;

export default async function RecursosPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    const recursos: RecursoConAsignaciones[] = await prisma.recurso.findMany({
        orderBy: { nombre: "asc" },
        include: {
            asignaciones: {
                where: { fechaHoraDesmovilizacion: null },
                include: {
                    incidente: {
                        select: { idIncidente: true, folio: true, nombre: true },
                    },
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-gris p-6 text-gray-900">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-rojo">Listado de Recursos</h1>
                <Link
                    href="/recursos/nuevo"
                    className="rounded-md bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
                >
                    + Nuevo recurso
                </Link>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
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
                                Institución
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Asignado a
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {recursos.map((recurso) => {
                            const asignacionActiva = recurso.asignaciones[0] ?? null;
                            const incidenteAsignado = asignacionActiva?.incidente ?? null;

                            return (
                                <tr key={recurso.idRecurso} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                                        {recurso.nombre}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        {recurso.clase}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        {recurso.tipo}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        {recurso.institucion || "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
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
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                        {incidenteAsignado ? (
                                            <Link
                                                href={`/incidentes/${incidenteAsignado.idIncidente}`}
                                                className="text-rojo hover:underline font-medium"
                                            >
                                                {incidenteAsignado.folio} - {incidenteAsignado.nombre}
                                            </Link>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/recursos/${recurso.idRecurso}`}
                                                className="rounded bg-carbon px-3 py-1 text-xs font-medium text-white hover:bg-carbon-oscuro"
                                            >
                                                Ver
                                            </Link>
                                            {recurso.estado === "ASIGNADO" && asignacionActiva && (
                                                <BotonDesmovilizar
                                                    asignacionId={asignacionActiva.idAsignacion}
                                                    recursoNombre={recurso.nombre}
                                                    incidenteFolio={asignacionActiva.incidente.folio}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
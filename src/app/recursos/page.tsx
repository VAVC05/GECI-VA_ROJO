import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import BotonDesmovilizar from "@/components/BotonDesmovilizar";

export default async function RecursosPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const recursos = await prisma.recurso.findMany({
    orderBy: { nombre: "asc" },
    include: {
      asignaciones: {
        where: { fechaHoraDesmovilizacion: null },
        include: {
          incidente: {
            select: { folio: true, nombre: true },
          },
        },
      },
    },
  });

  // Helper para obtener el incidente asignado (si está asignado)
  const getIncidenteAsignado = (recurso: any) => {
    const asignacionActiva = recurso.asignaciones.find(
      (a: any) => a.fechaHoraDesmovilizacion === null
    );
    return asignacionActiva?.incidente || null;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Listado de Recursos</h1>
        <Link
          href="/recursos/nuevo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + Nuevo recurso
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Clase
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Institución
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Asignado a
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {recursos.map((recurso) => {
              const incidenteAsignado = getIncidenteAsignado(recurso);
              return (
                <tr key={recurso.idRecurso} className="hover:bg-slate-800/50">
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
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-400">
                    {incidenteAsignado ? (
                      <Link
                        href={`/incidentes/${incidenteAsignado.idIncidente}`}
                        className="text-cyan-400 hover:underline"
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
                        className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
                      >
                        Ver
                      </Link>
							{recurso.estado === "ASIGNADO" && (() => {
  const asignacionActiva = recurso.asignaciones.find(
    (a: any) => a.fechaHoraDesmovilizacion === null
  );
  if (!asignacionActiva) return null;
  return (
    <BotonDesmovilizar
      asignacionId={asignacionActiva.idAsignacion}
      recursoNombre={recurso.nombre}
      incidenteFolio={asignacionActiva.incidente.folio}
    />
  );
})()}
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
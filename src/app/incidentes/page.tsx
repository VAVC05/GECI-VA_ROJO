import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import BotonCerrar from "@/components/BotonCerrar";

export default async function IncidentesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const incidentes = await prisma.incidente.findMany({
    orderBy: { fechaHoraInicio: "desc" },
    take: 20,
    include: {
      usuarioRegistro: {
        select: { nombreCompleto: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rojo">Listado de Incidentes</h1>
        <Link
          href="/incidentes/nuevo"
          className="rounded-md bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
        >
          + Nuevo incidente
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Folio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Lugar
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Registrado por
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidentes.map((inc) => (
              <tr key={inc.idIncidente} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-rojo">
                  {inc.folio}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {inc.nombre}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {inc.tipo}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {inc.lugar}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      inc.estado === "ACTIVO"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {inc.estado}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                  {inc.usuarioRegistro?.nombreCompleto || "N/A"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {/* Ver */}
                    <Link
                      href={`/incidentes/${inc.idIncidente}`}
                      className="rounded bg-carbon px-3 py-1 text-xs font-medium text-white hover:bg-carbon-oscuro"
                    >
                      Ver
                    </Link>

                    {/* Editar (solo si está activo) */}
                    {inc.estado === "ACTIVO" && (
                      <Link
                        href={`/incidentes/${inc.idIncidente}/editar`}
                        className="rounded bg-gray-500 px-3 py-1 text-xs font-medium text-white hover:bg-gray-600"
                      >
                        Editar
                      </Link>
                    )}

                    {/* Cerrar (solo si está activo) */}
                    {inc.estado === "ACTIVO" && (
                      <BotonCerrar incidenteId={inc.idIncidente} nombre={inc.nombre} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
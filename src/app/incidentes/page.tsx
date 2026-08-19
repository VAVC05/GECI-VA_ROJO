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
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Listado de Incidentes</h1>
        <Link
          href="/incidentes/nuevo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + Nuevo incidente
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Folio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Lugar
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Registrado por
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {incidentes.map((inc) => (
              <tr key={inc.idIncidente} className="hover:bg-slate-800/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-cyan-400">
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
                        ? "bg-green-900/30 text-green-300"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {inc.estado}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-400">
                  {inc.usuarioRegistro?.nombreCompleto || "N/A"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {/* Ver */}
                    <Link
                      href={`/incidentes/${inc.idIncidente}`}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      Ver
                    </Link>

                    {/* Editar (solo si está activo) */}
                    {inc.estado === "ACTIVO" && (
                      <Link
                        href={`/incidentes/${inc.idIncidente}/editar`}
                        className="rounded bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-500"
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
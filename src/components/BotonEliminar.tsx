"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  incidenteId: number;
  folio: string;
  nombre: string;
}

export default function BotonEliminar({ incidenteId, folio, nombre }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const confirmarEliminar = async () => {
    setEliminando(true);
    setError("");

    try {
      const res = await fetch(`/api/incidentes/${incidenteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setAbierto(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="rounded border border-amber-600 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50"
      >
        Eliminar
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white p-5 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 break-words">
              ¿Eliminar el incidente?
            </h2>

            <p className="mt-3 text-sm text-gray-700 break-words">
              Estás a punto de eliminar el incidente{" "}
              <span className="font-semibold text-red-800 break-all">
                {folio}
              </span>{" "}
              —{" "}
              <span className="font-semibold break-words">{nombre}</span>.
            </p>

            <p className="mt-2 text-sm text-red-800">
              Se eliminará toda la información asociada a este incidente.
            </p>
            <p className="mt-1 text-sm text-red-800">
              Esta acción no se puede deshacer.
            </p>

            {error && (
              <p className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700 break-words">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => {
                  setAbierto(false);
                  setError("");
                }}
                disabled={eliminando}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
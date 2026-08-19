"use client";

import { useState } from "react";

interface BotonCerrarProps {
  incidenteId: number;
  nombre: string;
}

export default function BotonCerrar({ incidenteId, nombre }: BotonCerrarProps) {
  const [cerrando, setCerrando] = useState(false);

  const handleCerrar = async () => {
    if (!confirm(`¿Estás seguro de cerrar el incidente "${nombre}"?`)) {
      return;
    }

    setCerrando(true);
    try {
      const res = await fetch(`/api/incidentes/${incidenteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observaciones: "Cerrado desde el listado",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al cerrar");
      }

      // Recargar la página para actualizar la tabla
      window.location.reload();
    } catch (error: any) {
      console.error("Error al cerrar:", error);
      alert(`Error al cerrar: ${error.message || "Error desconocido"}`);
    } finally {
      setCerrando(false);
    }
  };

  return (
    <button
      onClick={handleCerrar}
      disabled={cerrando}
      className={`rounded px-3 py-1 text-xs font-medium text-white ${
        cerrando
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-500"
      }`}
    >
      {cerrando ? "Cerrando..." : "Cerrar"}
    </button>
  );
}
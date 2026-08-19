"use client";

import { useState } from "react";

interface BotonDesmovilizarProps {
  asignacionId: number;
  recursoNombre: string;
  incidenteFolio: string;
}

export default function BotonDesmovilizar({
  asignacionId,
  recursoNombre,
  incidenteFolio,
}: BotonDesmovilizarProps) {
  const [desmovilizando, setDesmovilizando] = useState(false);

  const handleDesmovilizar = async () => {
    if (
      !confirm(
        `¿Desmovilizar "${recursoNombre}" del incidente ${incidenteFolio}?`
      )
    ) {
      return;
    }

    setDesmovilizando(true);
    try {
      const res = await fetch(`/api/asignaciones/${asignacionId}/desmovilizar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observaciones: "Desmovilizado desde el listado",
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Error al desmovilizar: ${errorData.error || "Error desconocido"}`);
      }
    } catch (error) {
      alert("Error de red al intentar desmovilizar.");
    } finally {
      setDesmovilizando(false);
    }
  };

  return (
    <button
      onClick={handleDesmovilizar}
      disabled={desmovilizando}
      className={`rounded px-3 py-1 text-xs font-medium text-white ${
        desmovilizando
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-500"
      }`}
    >
      {desmovilizando ? "Desmovilizando..." : "Desmovilizar"}
    </button>
  );
}
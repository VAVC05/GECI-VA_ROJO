"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Incidente {
  idIncidente: number;
  folio: string;
  nombre: string;
  tipo: string;
  lugar: string;
  estado: "ACTIVO" | "CERRADO";
  fechaHoraInicio: string;
  fechaHoraCierre: string | null;
  amenazasPresentes: string | null;
  areasAfectadas: string | null;
  objetivoInicial: string | null;
  ubicacionPc: string | null;
  ubicacionAe: string | null;
  rutaIngreso: string | null;
  rutaEgreso: string | null;
  mensajeSeguridad: string | null;
  canalesComunicacion: string | null;
  observacionesCierre: string | null;
  usuarioRegistro: {
    nombreCompleto: string;
    correo: string;
  };
  usuarioCierre: {
    nombreCompleto: string;
  } | null;
}

export default function SCI201Page() {
  const params = useParams();
  const id = params.id as string;

  const [incidente, setIncidente] = useState<Incidente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`/api/incidentes/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al cargar incidente");
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
  }, [id]);

  const generarPDF = () => {
    if (!incidente) return;
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(16);
    doc.setTextColor(179, 0, 0);
    doc.text("Formulario SCI-201 - Resumen del Incidente", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 30;
    const lineHeight = 7;

    const campos = [
      ["Folio:", incidente.folio],
      ["Nombre del incidente:", incidente.nombre],
      ["Tipo:", incidente.tipo],
      ["Lugar:", incidente.lugar],
      ["Fecha de inicio:", new Date(incidente.fechaHoraInicio).toLocaleString()],
      ["Estado:", incidente.estado],
      ["Amenazas presentes:", incidente.amenazasPresentes || "N/A"],
      ["Áreas afectadas:", incidente.areasAfectadas || "N/A"],
      ["Objetivo inicial:", incidente.objetivoInicial || "N/A"],
      ["Ubicación Puesto de Comando:", incidente.ubicacionPc || "N/A"],
      ["Ubicación Área de Espera:", incidente.ubicacionAe || "N/A"],
      ["Ruta de ingreso:", incidente.rutaIngreso || "N/A"],
      ["Ruta de egreso:", incidente.rutaEgreso || "N/A"],
      ["Mensaje de seguridad:", incidente.mensajeSeguridad || "N/A"],
      ["Canales de comunicación:", incidente.canalesComunicacion || "N/A"],
      ["Registrado por:", incidente.usuarioRegistro?.nombreCompleto || "N/A"],
    ];

    if (incidente.fechaHoraCierre) {
      campos.push(["Fecha de cierre:", new Date(incidente.fechaHoraCierre).toLocaleString()]);
    }
    if (incidente.usuarioCierre?.nombreCompleto) {
      campos.push(["Cerrado por:", incidente.usuarioCierre.nombreCompleto]);
    }
    if (incidente.observacionesCierre) {
      campos.push(["Observaciones de cierre:", incidente.observacionesCierre]);
    }

    campos.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 14, y);
      y += lineHeight;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generado desde GECI-VA el ${new Date().toLocaleString()}`, 14, 285);

    doc.save(`SCI-201_${incidente.folio}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Cargando formulario...</p>
      </div>
    );
  }

  if (error || !incidente) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p className="text-red-600">Error: {error || "Incidente no encontrado"}</p>
        <Link href={`/incidentes/${id}`} className="text-rojo hover:underline mt-4 block font-medium">
          Volver al detalle
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">SCI-201 - Resumen del Incidente</h1>
          <div className="flex gap-3">
            <button
              onClick={generarPDF}
              className="rounded bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
            >
              Descargar PDF
            </button>
            <Link href={`/incidentes/${id}`} className="text-rojo hover:underline font-medium">
              ← Volver al detalle
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Folio</p>
              <p className="font-medium">{incidente.folio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nombre del incidente</p>
              <p className="font-medium">{incidente.nombre}</p>
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
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  incidente.estado === "ACTIVO"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {incidente.estado}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Información adicional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Amenazas presentes</p>
                <p>{incidente.amenazasPresentes || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Áreas afectadas</p>
                <p>{incidente.areasAfectadas || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Objetivo inicial</p>
                <p>{incidente.objetivoInicial || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Ubicación Puesto de Comando</p>
                <p>{incidente.ubicacionPc || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Ubicación Área de Espera</p>
                <p>{incidente.ubicacionAe || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Ruta de ingreso</p>
                <p>{incidente.rutaIngreso || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Ruta de egreso</p>
                <p>{incidente.rutaEgreso || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Mensaje de seguridad</p>
                <p>{incidente.mensajeSeguridad || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Canales de comunicación</p>
                <p>{incidente.canalesComunicacion || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Registrado por</p>
                <p>{incidente.usuarioRegistro?.nombreCompleto || "N/A"}</p>
              </div>
              {incidente.fechaHoraCierre && (
                <div>
                  <p className="text-gray-500">Fecha de cierre</p>
                  <p>{new Date(incidente.fechaHoraCierre).toLocaleString()}</p>
                </div>
              )}
              {incidente.usuarioCierre?.nombreCompleto && (
                <div>
                  <p className="text-gray-500">Cerrado por</p>
                  <p>{incidente.usuarioCierre.nombreCompleto}</p>
                </div>
              )}
            </div>
            {incidente.observacionesCierre && (
              <div className="mt-4">
                <p className="text-gray-500">Observaciones de cierre</p>
                <p className="text-sm border border-gray-200 rounded p-2 bg-gray-50">{incidente.observacionesCierre}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
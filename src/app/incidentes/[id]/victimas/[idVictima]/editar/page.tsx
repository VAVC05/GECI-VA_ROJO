"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Victima {
  idVictima: number;
  nombrePaciente: string | null;
  sexo: string | null;
  edad: number | null;
  lugarRegistro: string;
  estadoAtencion: "EN_ESPERA" | "ATENDIDO_EN_SITIO" | "TRASLADADO";
  centroHospitalario: string | null;
  notasAdicionales: string | null;
  idIncidente: number;
}

export default function EditarVictimaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const idVictima = params.idVictima as string;

  const [victima, setVictima] = useState<Victima | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [sexo, setSexo] = useState("");
  const [edad, setEdad] = useState<number | "">("");
  const [lugarRegistro, setLugarRegistro] = useState("");
  const [centroHospitalario, setCentroHospitalario] = useState("");
  const [notasAdicionales, setNotasAdicionales] = useState("");

  // Cargar datos de la víctima
  useEffect(() => {
    if (idVictima) {
      fetch(`/api/victimas/${idVictima}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al cargar víctima");
          }
          return res.json();
        })
        .then((data) => {
          setVictima(data);
          setNombrePaciente(data.nombrePaciente || "");
          setSexo(data.sexo || "");
          setEdad(data.edad ?? "");
          setLugarRegistro(data.lugarRegistro || "");
          setCentroHospitalario(data.centroHospitalario || "");
          setNotasAdicionales(data.notasAdicionales || "");
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [idVictima]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const data = {
      nombrePaciente: nombrePaciente.trim() || undefined,
      sexo: sexo || undefined,
      edad: edad === "" ? undefined : Number(edad),
      lugarRegistro: lugarRegistro,
      centroHospitalario: centroHospitalario.trim() || undefined,
      notasAdicionales: notasAdicionales.trim() || undefined,
    };

    try {
      const res = await fetch(`/api/victimas/${idVictima}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Víctima actualizada correctamente");
        setTimeout(() => {
          router.push(`/incidentes/${id}`);
        }, 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al actualizar víctima");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Cargando víctima...</p>
      </div>
    );
  }

  if (!victima) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Víctima no encontrada</p>
        <Link href={`/incidentes/${id}`} className="text-rojo hover:underline mt-4 block font-medium">
          Volver al detalle
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">Editar víctima</h1>
          <Link href={`/incidentes/${id}`} className="text-rojo hover:underline font-medium">
            ← Volver al detalle
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="nombrePaciente" className="block text-sm font-medium text-gray-700">
              Nombre del paciente *
            </label>
            <input
              type="text"
              id="nombrePaciente"
              value={nombrePaciente}
              onChange={(e) => setNombrePaciente(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">
              Sexo *
            </label>
            <select
              id="sexo"
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            >
              <option value="">Seleccionar sexo</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="edad" className="block text-sm font-medium text-gray-700">
              Edad
            </label>
            <input
              type="number"
              id="edad"
              value={edad}
              onChange={(e) => setEdad(e.target.value === "" ? "" : Number(e.target.value))}
              min="0"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              placeholder="Ej: 35"
            />
          </div>

          <div>
            <label htmlFor="lugarRegistro" className="block text-sm font-medium text-gray-700">
              Lugar de registro *
            </label>
            <select
              id="lugarRegistro"
              value={lugarRegistro}
              onChange={(e) => setLugarRegistro(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            >
              <option value="">Seleccionar lugar</option>
              <option value="ACV">ACV (Área de Concentración de Víctimas)</option>
              <option value="Unidad Médica">Unidad Médica</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="centroHospitalario" className="block text-sm font-medium text-gray-700">
              Centro hospitalario (traslado)
            </label>
            <input
              type="text"
              id="centroHospitalario"
              value={centroHospitalario}
              onChange={(e) => setCentroHospitalario(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              placeholder="Ej: Hospital General de Metepec"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si la víctima fue trasladada, puedes actualizar el hospital aquí.
            </p>
          </div>

          <div>
            <label htmlFor="notasAdicionales" className="block text-sm font-medium text-gray-700">
              Notas adicionales
            </label>
            <textarea
              id="notasAdicionales"
              value={notasAdicionales}
              onChange={(e) => setNotasAdicionales(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              placeholder="Información adicional sobre la víctima..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                saving
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-carbon hover:bg-carbon-oscuro"
              }`}
            >
              {saving ? "Guardando..." : "Actualizar víctima"}
            </button>
            <Link
              href={`/incidentes/${id}`}
              className="rounded bg-gray-200 px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
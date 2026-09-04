"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Rol {
  idRol: number;
  nombre: string;
}

interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  estado: boolean;
  rol: {
    idRol: number;
    nombre: string;
  };
}

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [idRol, setIdRol] = useState("");
  const [estado, setEstado] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        fetch(`/api/usuarios/${id}`).then((r) => r.json()),
        fetch("/api/roles").then((r) => r.json()),
      ])
        .then(([userData, rolesData]) => {
          setUsuario(userData);
          setNombreCompleto(userData.nombreCompleto || "");
          setIdRol(String(userData.rol?.idRol || ""));
          setEstado(userData.estado !== undefined ? userData.estado : true);
          setRoles(rolesData);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const data = {
      nombreCompleto,
      idRol: parseInt(idRol),
      estado,
    };

    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Usuario actualizado correctamente");
        setTimeout(() => {
          router.push("/admin/usuarios");
        }, 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al actualizar usuario");
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
        <p>Cargando usuario...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Usuario no encontrado</p>
        <Link href="/admin/usuarios" className="text-rojo hover:underline mt-4 block font-medium">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">Editar usuario</h1>
          <Link href="/admin/usuarios" className="text-rojo hover:underline font-medium">
            ← Volver al listado
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
            <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombreCompleto"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            />
          </div>

          <div>
            <label htmlFor="idRol" className="block text-sm font-medium text-gray-700">
              Rol *
            </label>
            <select
              id="idRol"
              value={idRol}
              onChange={(e) => setIdRol(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
            >
              <option value="">Seleccionar rol</option>
              {roles.map((rol) => (
                <option key={rol.idRol} value={rol.idRol}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <div className="mt-1 flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="activo"
                  checked={estado === true}
                  onChange={() => setEstado(true)}
                  className="text-rojo"
                />
                Activo
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="inactivo"
                  checked={estado === false}
                  onChange={() => setEstado(false)}
                  className="text-rojo"
                />
                Inactivo
              </label>
            </div>
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
              {saving ? "Guardando..." : "Actualizar usuario"}
            </button>
            <Link
              href="/admin/usuarios"
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
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  estado: boolean;
  fechaRegistro: string;
  fechaUltimoAcceso: string | null;
  rol: {
    idRol: number;
    nombre: string;
  };
}

export default function AdminUsuariosPage() {
  const { data: session } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarUsuarios = () => {
    setLoading(true);
    fetch("/api/usuarios")
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Error al cargar usuarios");
        }
        return res.json();
      })
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const toggleEstado = async (id: number, estadoActual: boolean) => {
    if (!confirm(`¿${estadoActual ? "Desactivar" : "Activar"} este usuario?`)) return;
    try {
      const res = await fetch(`/api/usuarios/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: !estadoActual }),
      });
      if (res.ok) {
        cargarUsuarios();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al cambiar estado");
      }
    } catch (err) {
      alert("Error de red");
    }
  };

  const eliminarUsuario = async (id: number, nombre: string) => {
    // ✅ CORREGIDO: usar idUsuario en lugar de id
    if (id === session?.user?.idUsuario) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }
    if (!confirm(`¿Eliminar permanentemente a "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        cargarUsuarios();
        alert("Usuario eliminado correctamente");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al eliminar usuario");
      }
    } catch (err) {
      alert("Error de red");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p className="text-red-600">Error: {error}</p>
        <Link href="/admin" className="text-rojo hover:underline mt-4 block font-medium">
          Volver al panel de administración
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-rojo">Gestión de Usuarios</h1>
          <Link
            href="/admin/usuarios/nuevo"
            className="rounded-md bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
          >
            + Nuevo usuario
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.idUsuario} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{usuario.nombreCompleto}</td>
                  <td className="px-4 py-3 text-sm">{usuario.correo}</td>
                  <td className="px-4 py-3 text-sm">{usuario.rol.nombre}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        usuario.estado
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {usuario.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/usuarios/${usuario.idUsuario}/editar`}
                        className="rounded bg-gray-500 px-3 py-1 text-xs font-medium text-white hover:bg-gray-600"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => toggleEstado(usuario.idUsuario, usuario.estado)}
                        className={`rounded px-3 py-1 text-xs font-medium text-white ${
                          usuario.estado
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {usuario.estado ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => eliminarUsuario(usuario.idUsuario, usuario.nombreCompleto)}
                        className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && (
            <div className="p-4 text-center text-gray-500">No hay usuarios registrados.</div>
          )}
        </div>
      </div>
    </div>
  );
}
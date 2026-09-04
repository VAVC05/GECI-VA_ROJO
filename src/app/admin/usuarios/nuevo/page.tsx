"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Rol {
  idRol: number;
  nombre: string;
}

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch(() => setError("Error al cargar roles"));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombreCompleto: formData.get("nombreCompleto") as string,
      correo: formData.get("correo") as string,
      contrasena: formData.get("contrasena") as string,
      idRol: parseInt(formData.get("idRol") as string),
    };

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/usuarios");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al crear usuario");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-rojo">Nuevo Usuario</h1>
          <Link href="/admin/usuarios" className="text-rojo hover:underline font-medium">
            ← Volver al listado
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
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
              name="nombreCompleto"
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              required
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              placeholder="ejemplo@geci-va.mx"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
              Contraseña *
            </label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              required
              minLength={8}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-rojo focus:outline-none focus:ring-1 focus:ring-rojo"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label htmlFor="idRol" className="block text-sm font-medium text-gray-700">
              Rol *
            </label>
            <select
              id="idRol"
              name="idRol"
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                cargando
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-carbon hover:bg-carbon-oscuro"
              }`}
            >
              {cargando ? "Guardando..." : "Crear usuario"}
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
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gris text-gray-500">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gris px-6 py-8">
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-rojo">
            Bienvenido, {session?.user?.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Correo: {session?.user?.email}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Rol: <span className="font-medium text-gray-900">{session?.user?.rol}</span>
          </p>

          {session?.user?.rol === "Administrador" && (
            <p className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Como Administrador, también puedes entrar a{" "}
              <Link href="/admin" className="font-medium text-rojo hover:underline">
                /admin
              </Link>
              .
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-rojo">Módulos del Sistema</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/incidentes">
              <button className="w-full rounded-md bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro">
                Incidentes
              </button>
            </Link>

            <Link href="/recursos">
              <button className="w-full rounded-md bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro">
                Recursos
              </button>
            </Link>

            <Link href="/estadisticas">
              <button className="w-full rounded-md bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro">
                Estadísticas
              </button>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-md bg-rojo px-4 py-2 text-sm font-medium text-white hover:bg-rojo-oscuro"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
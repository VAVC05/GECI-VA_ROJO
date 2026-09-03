"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Encabezado con logos alineados a la izquierda */}
        <div className="mb-8 flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <Image
            src="/logos/bomberos.png"
            alt="Bomberos Metepec"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="h-10 w-px bg-slate-700" />
          <Image
            src="/logos/pc_metepec.png"
            alt="Protección Civil Metepec"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="h-10 w-px bg-slate-700" />
          <div>
            <h1 className="text-xl font-bold text-white">GECI-VA</h1>
            <p className="text-xs text-slate-400">Sistema de Gestión de Incidentes</p>
          </div>
        </div>

        {/* Tarjeta de bienvenida */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-xl font-bold">Bienvenido, {session?.user?.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            Correo: {session?.user?.email}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Rol: <span className="font-medium text-white">{session?.user?.rol}</span>
          </p>

          {session?.user?.rol === "Administrador" && (
            <p className="mt-4 rounded-md border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
              Como Administrador, puedes gestionar usuarios y acceder a todas las funciones.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/incidentes">
              <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                Ver incidentes
              </button>
            </Link>

            <Link href="/recursos">
              <button className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500">
                Ver recursos
              </button>
            </Link>

            <Link href="/estadisticas">
              <button className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
                Ver estadísticas
              </button>
            </Link>

            {session?.user?.rol === "Administrador" && (
              <Link href="/admin/usuarios/nuevo">
                <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                  Crear nuevo usuario
                </button>
              </Link>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
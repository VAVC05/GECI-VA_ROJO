"use client";

import { useSession, signOut } from "next-auth/react";

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
      <div className="mx-auto max-w-lg rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-xl font-bold">Bienvenido, {session?.user?.name}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Correo: {session?.user?.email}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Rol: <span className="font-medium text-white">{session?.user?.rol}</span>
        </p>

        {session?.user?.rol === "Administrador" && (
          <p className="mt-4 rounded-md border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
            Como Administrador, también puedes entrar a /admin.
          </p>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}

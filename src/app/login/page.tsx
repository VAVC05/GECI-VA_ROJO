"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const correo = formData.get("correo") as string;
    const contrasena = formData.get("contrasena") as string;

    try {
      const result = await signIn("credentials", {
        correo,
        contrasena,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-xl">
        {/* Logos alineados a la izquierda, mismo tamaño */}
        <div className="mb-6 flex items-center gap-4">
          <Image
            src="/logos/bomberos.png"
            alt="Bomberos Metepec"
            width={50}
            height={50}
            className="rounded-full"
          />
          <div className="h-10 w-px bg-slate-700" />
          <Image
            src="/logos/pc_metepec.png"
            alt="Protección Civil Metepec"
            width={50}
            height={50}
            className="rounded-full"
          />
        </div>

        <h1 className="mb-1 text-2xl font-bold text-white">GECI-VA</h1>
        <p className="mb-6 text-sm text-slate-400">Sistema de Gestión del Comando de Incidentes</p>

        {error && (
          <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-slate-300">
              Correo electrónico
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="admin@geci-va.mx"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              required
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${
              loading
                ? "cursor-not-allowed bg-slate-600"
                : "bg-red-700 hover:bg-red-600" // Rojo institucional
            }`}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} GECI-VA · Protección Civil y Bomberos de Metepec
        </p>
      </div>
    </div>
  );
}
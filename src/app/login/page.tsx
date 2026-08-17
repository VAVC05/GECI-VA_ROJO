"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { esquemaLogin, type DatosLogin } from "@/lib/validaciones/auth";

export default function LoginPage() {
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosLogin>({
    resolver: zodResolver(esquemaLogin),
  });

  async function onSubmit(datos: DatosLogin) {
    setErrorGeneral(null);
    setEnviando(true);

    const resultado = await signIn("credentials", {
      correo: datos.correo,
      contrasena: datos.contrasena,
      redirect: false,
    });

    setEnviando(false);

    if (resultado?.error) {
      // No decimos si fue el correo o la contraseña, por seguridad.
      setErrorGeneral("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-white">GECI-VA</h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          Inicia sesión para continuar
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6"
        >
          <div>
            <label htmlFor="correo" className="block text-sm text-slate-300">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              {...register("correo")}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-slate-500"
            />
            {errors.correo && (
              <p className="mt-1 text-xs text-red-400">{errors.correo.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm text-slate-300">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              {...register("contrasena")}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-slate-500"
            />
            {errors.contrasena && (
              <p className="mt-1 text-xs text-red-400">{errors.contrasena.message}</p>
            )}
          </div>

          {errorGeneral && (
            <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">
              {errorGeneral}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-white py-2 font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

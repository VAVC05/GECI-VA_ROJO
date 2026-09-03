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
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gris px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-rojo">Inicio de sesión</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="correo" className="block text-sm text-gray-700">
              Usuario
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              {...register("correo")}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-rojo focus:ring-1 focus:ring-rojo"
            />
            {errors.correo && (
              <p className="mt-1 text-xs text-red-600">{errors.correo.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm text-gray-700">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              {...register("contrasena")}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-rojo focus:ring-1 focus:ring-rojo"
            />
            {errors.contrasena && (
              <p className="mt-1 text-xs text-red-600">{errors.contrasena.message}</p>
            )}
          </div>

          {errorGeneral && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorGeneral}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-carbon py-2 font-medium text-white transition hover:bg-carbon-oscuro disabled:opacity-50"
          >
            {enviando ? "Entrando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}

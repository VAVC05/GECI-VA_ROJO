import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gris px-6 py-10">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center max-w-md">
        <h1 className="text-2xl font-bold text-rojo">Panel de Administrador</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gestiona usuarios y configura el sistema.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/admin/usuarios"
            className="rounded-md bg-carbon px-6 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
          >
            Gestionar usuarios
          </Link>
        </div>
      </div>
    </main>
  );
}
export default function AdminPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
        <h1 className="text-xl font-bold">Panel de Administrador</h1>
        <p className="mt-2 text-sm text-slate-400">
          Si estás viendo esto, el middleware confirmó que tu rol es Administrador.
          Aquí irá la gestión de usuarios en la siguiente entrega.
        </p>
      </div>
    </main>
  );
}

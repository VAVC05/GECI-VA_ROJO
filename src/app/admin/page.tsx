export default function AdminPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gris px-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-center">
        <h1 className="text-xl font-bold text-rojo">Panel de Administrador</h1>
        <p className="mt-2 text-sm text-gray-500">
          Si estás viendo esto, el middleware confirmó que tu rol es Administrador.
          Aquí irá la gestión de usuarios en la siguiente entrega.
        </p>
      </div>
    </main>
  );
}

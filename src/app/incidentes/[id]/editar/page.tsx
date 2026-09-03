"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditarIncidentePage() {
  const params = useParams();
  const id = params.id;

  return (
    <main className="min-h-screen bg-gris text-gray-900 p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/incidentes" className="text-rojo hover:underline block mb-4 font-medium">
          ← Volver al listado
        </Link>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-rojo">Editar incidente {id}</h1>
          <p className="mt-4 text-gray-500">Formulario de edición (próximamente)</p>
        </div>
      </div>
    </main>
  );
}
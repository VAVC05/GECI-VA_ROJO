"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditarIncidentePage() {
  const params = useParams();
  const id = params.id;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/incidentes" className="text-blue-400 hover:underline block mb-4">
          ← Volver al listado
        </Link>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Editar incidente {id}</h1>
          <p className="mt-4 text-slate-400">Formulario de edición (próximamente)</p>
        </div>
      </div>
    </main>
  );
}
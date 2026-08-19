"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function EstadisticasPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/estadisticas")
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Error al cargar estadísticas</p>
      </div>
    );
  }

  // Preparar datos para gráficas
  const tipoData = data.incidentesPorTipo.map((item: any) => ({
    name: item.tipo || "Sin clasificar",
    value: item._count,
  }));

  const mesData = data.incidentesPorMes.map((item: any) => ({
    name: `Mes ${item.mes}`,
    total: Number(item.total),
  }));

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Estadísticas {data.anio}</h1>

      {/* Tarjetas de métricas */}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
    <p className="text-sm text-slate-400">Total incidentes</p>
    <p className="text-2xl font-bold">{data.totalIncidentes || 0}</p>
  </div>
  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
    <p className="text-sm text-slate-400">Víctimas atendidas</p>
    <p className="text-2xl font-bold">{data.totalVictimas || 0}</p>
  </div>
  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
    <p className="text-sm text-slate-400">Recursos utilizados</p>
    <p className="text-2xl font-bold">{data.totalRecursosUtilizados || 0}</p>
  </div>
  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
    <p className="text-sm text-slate-400">Promedio atención</p>
    <p className="text-2xl font-bold">
      {data.promedioHorasAtencion?.toFixed(1) || '0.0'} hrs
    </p>
  </div>
</div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incidentes por tipo (Pie) */}
        <div className="rounded-lg bg-slate-900 p-4 border border-slate-800">
          <h2 className="text-lg font-semibold mb-4">Incidentes por tipo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tipoData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tipoData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Incidentes por mes (Bar) */}
        <div className="rounded-lg bg-slate-900 p-4 border border-slate-800">
          <h2 className="text-lg font-semibold mb-4">Incidentes por mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recursos utilizados */}
        <div className="rounded-lg bg-slate-900 p-4 border border-slate-800">
          <h2 className="text-lg font-semibold mb-4">Recursos utilizados</h2>
          <p className="text-3xl font-bold text-cyan-400">{data.totalRecursosUtilizados}</p>
          <p className="text-sm text-slate-400">Asignaciones realizadas</p>
        </div>

        {/* Tiempo promedio */}
        <div className="rounded-lg bg-slate-900 p-4 border border-slate-800">
          <h2 className="text-lg font-semibold mb-4">Tiempo promedio de atención</h2>
          <p className="text-3xl font-bold text-purple-400">
            {data.promedioHorasAtencion?.toFixed(1) || '0.0'} hrs
          </p>
          <p className="text-sm text-slate-400">Por incidente cerrado</p>
        </div>
      </div>
    </div>
  );
}
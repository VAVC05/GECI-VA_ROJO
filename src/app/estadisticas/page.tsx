"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface IncidentePorTipo {
  tipo: string | null;
  _count: number;
}

interface IncidentePorMes {
  mes: number;
  total: number | string;
}

interface EstadisticasData {
  anio: number;
  totalIncidentes: number;
  totalVictimas: number;
  totalRecursosUtilizados: number;
  promedioHorasAtencion: number | null;
  incidentesPorTipo: IncidentePorTipo[];
  incidentesPorMes: IncidentePorMes[];
}

interface TipoChartData {
  name: string;
  value: number;
}

interface MesChartData {
  name: string;
  total: number;
}

export default function EstadisticasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    let activo = true;

    const cargar = async () => {
      try {
        const res = await fetch("/api/estadisticas");
        const json: EstadisticasData = await res.json();
        if (activo) setData(json);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const generarPDF = () => {
    if (!data) return;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(179, 0, 0);
    doc.text(`Estadísticas ${data.anio}`, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("GECI-VA — Coordinación de Protección Civil y Bomberos de Metepec", 14, 27);

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    let y = 42;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de incidentes: ${data.totalIncidentes || 0}`, 14, y); y += 8;
    doc.text(`Víctimas atendidas: ${data.totalVictimas || 0}`, 14, y); y += 8;
    doc.text(`Recursos utilizados: ${data.totalRecursosUtilizados || 0}`, 14, y); y += 8;
    doc.text(`Promedio de atención: ${data.promedioHorasAtencion?.toFixed(1) || "0.0"} hrs`, 14, y); y += 12;

    doc.setFontSize(13);
    doc.setTextColor(179, 0, 0);
    doc.text("Incidentes por tipo", 14, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Tipo", "Cantidad"]],
      body: data.incidentesPorTipo.map((item) => [
        item.tipo || "Sin clasificar",
        item._count,
      ]),
      theme: "striped",
      headStyles: { fillColor: [179, 0, 0], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10;

    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setTextColor(179, 0, 0);
    doc.text("Incidentes por mes", 14, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Mes", "Cantidad"]],
      body: data.incidentesPorMes.map((item) => [`Mes ${item.mes}`, item.total]),
      theme: "striped",
      headStyles: { fillColor: [179, 0, 0], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generado desde GECI-VA el ${new Date().toLocaleString()}`,
      14,
      285
    );

    doc.save(`estadisticas_${data.anio}.pdf`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gris p-6 text-gray-900">
        <p>Error al cargar estadísticas</p>
      </div>
    );
  }

  const tipoData: TipoChartData[] = data.incidentesPorTipo.map((item) => ({
    name: item.tipo || "Sin clasificar",
    value: item._count,
  }));

  const mesData: MesChartData[] = data.incidentesPorMes.map((item) => ({
    name: `Mes ${item.mes}`,
    total: Number(item.total),
  }));

  return (
    <div className="min-h-screen bg-gris p-6 text-gray-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-rojo">
          Estadísticas {data.anio}
        </h1>
        <button
          onClick={generarPDF}
          className="rounded bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
        >
          Descargar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total incidentes</p>
          <p className="text-2xl font-bold">{data.totalIncidentes || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Víctimas atendidas</p>
          <p className="text-2xl font-bold">{data.totalVictimas || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recursos utilizados</p>
          <p className="text-2xl font-bold">
            {data.totalRecursosUtilizados || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Promedio atención</p>
          <p className="text-2xl font-bold">
            {data.promedioHorasAtencion?.toFixed(1) || "0.0"} hrs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Incidentes por tipo
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tipoData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent = 0 }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tipoData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Incidentes por mes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="total" fill="#b30000" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Recursos utilizados
          </h2>
          <p className="text-3xl font-bold text-carbon">
            {data.totalRecursosUtilizados}
          </p>
          <p className="text-sm text-gray-500">Asignaciones realizadas</p>
        </div>

        <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Tiempo promedio de atención
          </h2>
          <p className="text-3xl font-bold text-carbon">
            {data.promedioHorasAtencion?.toFixed(1) || "0.0"} hrs
          </p>
          <p className="text-sm text-gray-500">Por incidente cerrado</p>
        </div>
      </div>
    </div>
  );
}
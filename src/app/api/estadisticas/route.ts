import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Total de incidentes
    const totalIncidentes = await prisma.incidente.count();

    // Incidentes por tipo
    const incidentesPorTipo = await prisma.incidente.groupBy({
      by: ['tipo'],
      _count: true,
    });

    // Incidentes por estado
    const incidentesPorEstado = await prisma.incidente.groupBy({
      by: ['estado'],
      _count: true,
    });

    // Incidentes por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const incidentesPorMesRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', fecha_hora_inicio) as mes,
        COUNT(*) as total
      FROM incidentes
      WHERE fecha_hora_inicio >= ${seisMesesAtras}
      GROUP BY DATE_TRUNC('month', fecha_hora_inicio)
      ORDER BY mes ASC
    `;

    // Convertir BigInt a Number en incidentesPorMes
    const incidentesPorMes = (incidentesPorMesRaw as any[]).map((item) => ({
      mes: item.mes,
      total: Number(item.total),
    }));

    // Total de víctimas atendidas
    const totalVictimas = await prisma.victima.count();

    // Total de recursos utilizados (asignaciones activas o totales)
    const totalRecursosUtilizados = await prisma.asignacionRecurso.count();

    // Tiempo promedio de atención (en horas, solo incidentes cerrados)
    const avgTiempoAtencionRaw = await prisma.$queryRaw<{ promedio_horas: number }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM (fecha_hora_cierre - fecha_hora_inicio)) / 3600) as promedio_horas
      FROM incidentes
      WHERE estado = 'CERRADO' AND fecha_hora_cierre IS NOT NULL
    `;

    // Convertir BigInt a Number en promedioHorasAtencion
    const promedioHorasAtencion = avgTiempoAtencionRaw[0]?.promedio_horas 
      ? Number(avgTiempoAtencionRaw[0].promedio_horas) 
      : 0;

    return NextResponse.json({
      totalIncidentes,
      incidentesPorTipo,
      incidentesPorEstado,
      incidentesPorMes,
      totalVictimas,
      totalRecursosUtilizados,
      promedioHorasAtencion,
    });
  } catch (error) {
    console.error('Error en GET /api/estadisticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
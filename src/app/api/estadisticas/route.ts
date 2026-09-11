import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface IncidentePorMes {
    mes: Date;
    total: bigint;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const totalIncidentes = await prisma.incidente.count();

        const incidentesPorTipo = await prisma.incidente.groupBy({
            by: ['tipo'],
            _count: true,
        });

        const incidentesPorEstado = await prisma.incidente.groupBy({
            by: ['estado'],
            _count: true,
        });

        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

        const incidentesPorMesRaw = await prisma.$queryRaw<IncidentePorMes[]>`
      SELECT 
        DATE_TRUNC('month', fecha_hora_inicio) as mes,
        COUNT(*) as total
      FROM incidentes
      WHERE fecha_hora_inicio >= ${seisMesesAtras}
      GROUP BY DATE_TRUNC('month', fecha_hora_inicio)
      ORDER BY mes ASC
    `;

        const incidentesPorMes = incidentesPorMesRaw.map((item) => ({
            mes: item.mes,
            total: Number(item.total),
        }));

        const totalVictimas = await prisma.victima.count();
        const totalRecursosUtilizados = await prisma.asignacionRecurso.count();

        const avgTiempoAtencionRaw = await prisma.$queryRaw<{ promedio_horas: number | null }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM (fecha_hora_cierre - fecha_hora_inicio)) / 3600) as promedio_horas
      FROM incidentes
      WHERE estado = 'CERRADO' AND fecha_hora_cierre IS NOT NULL
    `;

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
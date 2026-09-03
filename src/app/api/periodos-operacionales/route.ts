import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createPeriodoSchema = z.object({
  idIncidente: z.number().int(),
  numeroPeriodo: z.number().int().min(1),
  fechaHoraInicio: z.string().datetime(),
  fechaHoraFin: z.string().datetime(),
  observaciones: z.string().optional(),
});

// GET /api/periodos-operacionales
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idIncidente = searchParams.get('idIncidente');

    if (!idIncidente) {
      return NextResponse.json(
        { error: 'Se requiere idIncidente' },
        { status: 400 }
      );
    }

    const periodos = await prisma.periodoOperacional.findMany({
      where: { idIncidente: parseInt(idIncidente) },
      orderBy: { numeroPeriodo: 'asc' },
    });

    return NextResponse.json(periodos);
  } catch (error) {
    console.error('Error en GET /api/periodos-operacionales:', error);
    return NextResponse.json(
      { error: 'Error al obtener periodos' },
      { status: 500 }
    );
  }
}

// POST /api/periodos-operacionales
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rolesPermitidos = ['Administrador', 'Tecnico Operativo'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear periodos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createPeriodoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const { idIncidente, numeroPeriodo, fechaHoraInicio, fechaHoraFin, observaciones } = result.data;

    const incidente = await prisma.incidente.findUnique({
      where: { idIncidente },
    });
    if (!incidente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
    }
    if (incidente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'Solo se pueden crear periodos para incidentes activos' },
        { status: 400 }
      );
    }

    const nuevoPeriodo = await prisma.periodoOperacional.create({
      data: {
        idIncidente,
        numeroPeriodo,
        fechaHoraInicio: new Date(fechaHoraInicio),
        fechaHoraFin: new Date(fechaHoraFin),
        observaciones,
      },
    });

    return NextResponse.json(nuevoPeriodo, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/periodos-operacionales:', error);
    return NextResponse.json(
      { error: 'Error al crear periodo' },
      { status: 500 }
    );
  }
}
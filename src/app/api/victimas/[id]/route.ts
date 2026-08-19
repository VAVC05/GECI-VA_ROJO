import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateVictimaSchema = z.object({
  nombrePaciente: z.string().optional(),
  sexo: z.string().optional(),
  edad: z.number().int().min(0).optional(),
  lugarRegistro: z.string().optional(),
  notasAdicionales: z.string().optional(),
  estadoAtencion: z.enum(['EN_ESPERA', 'ATENDIDO_EN_SITIO', 'TRASLADADO']).optional(),
});

// GET /api/victimas/[id] - Detalle de una víctima
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const victima = await prisma.victima.findUnique({
      where: { idVictima: idNumero },
      include: {
        incidente: {
          select: { idIncidente: true, folio: true, nombre: true },
        },
        usuarioRegistro: {
          select: { nombreCompleto: true, correo: true },
        },
        historialTriage: {
          orderBy: { fechaHoraClasificacion: 'desc' },
          include: {
            usuarioClasifico: {
              select: { nombreCompleto: true },
            },
          },
        },
      },
    });

    if (!victima) {
      return NextResponse.json({ error: 'Víctima no encontrada' }, { status: 404 });
    }

    return NextResponse.json(victima);
  } catch (error) {
    console.error('Error en GET /api/victimas/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener víctima' },
      { status: 500 }
    );
  }
}

// PUT /api/victimas/[id] - Editar una víctima
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rolesPermitidos = ['Administrador', 'Jefe Paramedicos'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar víctimas' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = updateVictimaSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const victimaExistente = await prisma.victima.findUnique({
      where: { idVictima: idNumero },
    });

    if (!victimaExistente) {
      return NextResponse.json({ error: 'Víctima no encontrada' }, { status: 404 });
    }

    const victimaActualizada = await prisma.victima.update({
      where: { idVictima: idNumero },
      data: result.data,
      include: {
        usuarioRegistro: {
          select: { nombreCompleto: true, correo: true },
        },
      },
    });

    return NextResponse.json(victimaActualizada);
  } catch (error) {
    console.error('Error en PUT /api/victimas/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar víctima' },
      { status: 500 }
    );
  }
}
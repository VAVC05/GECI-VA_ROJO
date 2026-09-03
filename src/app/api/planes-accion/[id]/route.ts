import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updatePlanSchema = z.object({
  objetivosOperacionales: z.string().optional(),
  estrategias: z.string().optional(),
  tacticas: z.string().optional(),
  recursosEnLugar: z.string().optional(),
  recursosPorSolicitar: z.string().optional(),
  mensajeSeguridad: z.string().optional(),
  nombreJefePlanificacion: z.string().optional(),
});

// GET /api/planes-accion/[id]
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

    const plan = await prisma.planAccion.findUnique({
      where: { idPai: idNumero },
      include: {
        incidente: {
          select: { idIncidente: true, folio: true, nombre: true },
        },
        periodo: {
          select: { idPeriodo: true, numeroPeriodo: true, fechaHoraInicio: true, fechaHoraFin: true },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan de acción no encontrado' }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error en GET /api/planes-accion/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener plan de acción' },
      { status: 500 }
    );
  }
}

// PUT /api/planes-accion/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rolesPermitidos = ['Administrador', 'Tecnico Operativo'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar planes de acción' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = updatePlanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const planExistente = await prisma.planAccion.findUnique({
      where: { idPai: idNumero },
      include: { incidente: true },
    });

    if (!planExistente) {
      return NextResponse.json({ error: 'Plan de acción no encontrado' }, { status: 404 });
    }

    if (planExistente.incidente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'No se puede editar un plan de un incidente cerrado' },
        { status: 400 }
      );
    }

    const planActualizado = await prisma.planAccion.update({
      where: { idPai: idNumero },
      data: {
        ...result.data,
        fechaModificacion: new Date(),
      },
      include: {
        incidente: {
          select: { idIncidente: true, folio: true, nombre: true },
        },
        periodo: {
          select: { idPeriodo: true, numeroPeriodo: true, fechaHoraInicio: true, fechaHoraFin: true },
        },
      },
    });

    return NextResponse.json(planActualizado);
  } catch (error) {
    console.error('Error en PUT /api/planes-accion/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar plan de acción' },
      { status: 500 }
    );
  }
}

// DELETE /api/planes-accion/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rolesPermitidos = ['Administrador', 'Tecnico Operativo'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar planes de acción' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const planExistente = await prisma.planAccion.findUnique({
      where: { idPai: idNumero },
      include: { incidente: true },
    });

    if (!planExistente) {
      return NextResponse.json({ error: 'Plan de acción no encontrado' }, { status: 404 });
    }

    if (planExistente.incidente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'No se puede eliminar un plan de un incidente cerrado' },
        { status: 400 }
      );
    }

    await prisma.planAccion.delete({
      where: { idPai: idNumero },
    });

    return NextResponse.json({ message: 'Plan de acción eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/planes-accion/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar plan de acción' },
      { status: 500 }
    );
  }
}
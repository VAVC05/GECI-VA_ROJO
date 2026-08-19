import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const desmovilizarSchema = z.object({
  observaciones: z.string().optional(),
});

// PATCH /api/asignaciones/[id]/desmovilizar
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rolesPermitidos = ['Administrador', 'Tecnico Operativo', 'Jefe Bomberos', 'Jefe Paramedicos'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para desmovilizar recursos' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = desmovilizarSchema.safeParse(body);

    // Obtener la asignación
    const asignacion = await prisma.asignacionRecurso.findUnique({
      where: { idAsignacion: idNumero },
    });

    if (!asignacion) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });
    }

    if (asignacion.fechaHoraDesmovilizacion !== null) {
      return NextResponse.json(
        { error: 'Este recurso ya fue desmovilizado' },
        { status: 400 }
      );
    }

    // Desmovilizar
    const asignacionDesmovilizada = await prisma.asignacionRecurso.update({
      where: { idAsignacion: idNumero },
      data: {
        fechaHoraDesmovilizacion: new Date(),
        observacionesDesmovilizacion: result.data?.observaciones || 'Desmovilizado',
      },
    });

    // Cambiar estado del recurso a DISPONIBLE
    await prisma.recurso.update({
      where: { idRecurso: asignacion.idRecurso },
      data: { estado: 'DISPONIBLE' },
    });

    return NextResponse.json(asignacionDesmovilizada);
  } catch (error) {
    console.error('Error en PATCH /api/asignaciones/[id]/desmovilizar:', error);
    return NextResponse.json(
      { error: 'Error al desmovilizar recurso' },
      { status: 500 }
    );
  }
}
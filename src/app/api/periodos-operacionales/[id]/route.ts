import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
        { error: 'No tienes permisos para eliminar periodos' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const periodo = await prisma.periodoOperacional.findUnique({
      where: { idPeriodo: idNumero },
      include: { incidente: true },
    });

    if (!periodo) {
      return NextResponse.json({ error: 'Periodo no encontrado' }, { status: 404 });
    }

    if (periodo.incidente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'No se puede eliminar un periodo de un incidente cerrado' },
        { status: 400 }
      );
    }

    await prisma.periodoOperacional.delete({
      where: { idPeriodo: idNumero },
    });

    return NextResponse.json({ message: 'Periodo eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/periodos-operacionales/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar periodo' },
      { status: 500 }
    );
  }
}
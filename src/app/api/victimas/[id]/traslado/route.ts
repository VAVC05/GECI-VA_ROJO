import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const trasladoSchema = z.object({
  centroHospitalario: z.string().min(1, 'El centro hospitalario es obligatorio'),
  observaciones: z.string().optional(),
});

// PATCH /api/victimas/[id]/traslado - Registrar traslado
export async function PATCH(
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
        { error: 'No tienes permisos para registrar traslados' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = trasladoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const victima = await prisma.victima.findUnique({
      where: { idVictima: idNumero },
    });

    if (!victima) {
      return NextResponse.json({ error: 'Víctima no encontrada' }, { status: 404 });
    }

    // Actualizar víctima con el traslado
    const victimaActualizada = await prisma.victima.update({
      where: { idVictima: idNumero },
      data: {
        estadoAtencion: 'TRASLADADO',
        centroHospitalario: result.data.centroHospitalario,
        fechaHoraTraslado: new Date(),
        notasAdicionales: result.data.observaciones || victima.notasAdicionales,
      },
      include: {
        usuarioRegistro: {
          select: { nombreCompleto: true, correo: true },
        },
      },
    });

    return NextResponse.json(victimaActualizada);
  } catch (error) {
    console.error('Error en PATCH /api/victimas/[id]/traslado:', error);
    return NextResponse.json(
      { error: 'Error al registrar traslado' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const triageSchema = z.object({
  clasificacion: z.enum(['ROJO', 'AMARILLO', 'VERDE', 'NEGRO']),
});

// PATCH /api/victimas/[id]/triage - Clasificar por triage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo Jefe Paramédicos y Administrador pueden clasificar
    const rolesPermitidos = ['Administrador', 'Jefe Paramedicos'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para clasificar víctimas' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = triageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const victima = await prisma.victima.findUnique({
      where: { idVictima: idNumero },
    });

    if (!victima) {
      return NextResponse.json({ error: 'Víctima no encontrada' }, { status: 404 });
    }

    // Registrar la clasificación en el historial
    const nuevaClasificacion = await prisma.historialTriage.create({
      data: {
        idVictima: idNumero,
        clasificacion: result.data.clasificacion,
        idUsuarioClasifico: session.user.idUsuario,
      },
    });

    return NextResponse.json(nuevaClasificacion, { status: 201 });
  } catch (error) {
    console.error('Error en PATCH /api/victimas/[id]/triage:', error);
    return NextResponse.json(
      { error: 'Error al clasificar víctima' },
      { status: 500 }
    );
  }
}
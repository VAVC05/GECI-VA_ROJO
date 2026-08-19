import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateRecursoSchema = z.object({
  nombre: z.string().min(3).optional(),
  clase: z.string().optional(),
  tipo: z.string().optional(),
  institucion: z.string().optional(),
  matricula: z.string().optional(),
  numeroPersonas: z.number().int().min(0).optional(),
  estado: z.enum(['DISPONIBLE', 'ASIGNADO', 'NO_DISPONIBLE']).optional(),
});

// GET /api/recursos/[id] - Ver detalle de un recurso
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

    const recurso = await prisma.recurso.findUnique({
      where: { idRecurso: idNumero },
      include: {
        asignaciones: {
          include: {
            incidente: {
              select: { idIncidente: true, folio: true, nombre: true },
            },
            usuarioAsigno: {
              select: { nombreCompleto: true, correo: true },
            },
          },
          orderBy: { fechaHoraAsignacion: 'desc' },
        },
      },
    });

    if (!recurso) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }

    return NextResponse.json(recurso);
  } catch (error) {
    console.error('Error en GET /api/recursos/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener recurso' },
      { status: 500 }
    );
  }
}

// PUT /api/recursos/[id] - Editar recurso
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo Administrador puede editar recursos
    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar recursos' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = updateRecursoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const recursoExistente = await prisma.recurso.findUnique({
      where: { idRecurso: idNumero },
    });

    if (!recursoExistente) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }

    const recursoActualizado = await prisma.recurso.update({
      where: { idRecurso: idNumero },
      data: result.data,
    });

    return NextResponse.json(recursoActualizado);
  } catch (error) {
    console.error('Error en PUT /api/recursos/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar recurso' },
      { status: 500 }
    );
  }
}
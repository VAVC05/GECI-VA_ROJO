import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const asignarRecursoSchema = z.object({
  idIncidente: z.number().int(),
  idRecurso: z.number().int(),
  tareaAsignada: z.string().optional(),
  ubicacionAsignacion: z.string().optional(),
});

// POST /api/asignaciones - Asignar un recurso a un incidente
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const rolesPermitidos = ['Administrador', 'Tecnico Operativo', 'Jefe Bomberos', 'Jefe Paramedicos'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para asignar recursos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = asignarRecursoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const { idIncidente, idRecurso, tareaAsignada, ubicacionAsignacion } = result.data;

    // Verificar que el incidente existe y está activo
    const incidente = await prisma.incidente.findUnique({
      where: { idIncidente },
    });
    if (!incidente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
    }
    if (incidente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'No se pueden asignar recursos a incidentes cerrados' },
        { status: 400 }
      );
    }

    // Verificar que el recurso existe y está disponible
    const recurso = await prisma.recurso.findUnique({
      where: { idRecurso },
    });
    if (!recurso) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }
    if (recurso.estado !== 'DISPONIBLE') {
      return NextResponse.json(
        { error: 'El recurso no está disponible' },
        { status: 400 }
      );
    }

    // Crear asignación
    const asignacion = await prisma.asignacionRecurso.create({
      data: {
        idIncidente,
        idRecurso,
        tareaAsignada,
        ubicacionAsignacion,
        idUsuarioAsigno: session.user.idUsuario,
      },
    });

    // Actualizar el estado del recurso a ASIGNADO
    await prisma.recurso.update({
      where: { idRecurso },
      data: { estado: 'ASIGNADO' },
    });

    return NextResponse.json(asignacion, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/asignaciones:', error);
    return NextResponse.json(
      { error: 'Error al asignar recurso' },
      { status: 500 }
    );
  }
}
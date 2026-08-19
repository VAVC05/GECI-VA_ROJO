import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateIncidentSchema = z.object({
  nombre: z.string().min(3).optional(),
  tipo: z.string().optional(),
  lugar: z.string().optional(),
  amenazasPresentes: z.string().optional(),
  areasAfectadas: z.string().optional(),
  objetivoInicial: z.string().optional(),
  ubicacionPc: z.string().optional(),
  ubicacionAe: z.string().optional(),
  rutaIngreso: z.string().optional(),
  rutaEgreso: z.string().optional(),
  mensajeSeguridad: z.string().optional(),
  canalesComunicacion: z.string().optional(),
});

// GET /api/incidentes/[id]
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

    const incidente = await prisma.incidente.findUnique({
      where: { idIncidente: idNumero },
      include: {
        usuarioRegistro: {
          select: { nombreCompleto: true, correo: true },
        },
        victimas: {
          include: { historialTriage: true },
        },
        asignacionesRecurso: {
          include: { recurso: true },
        },
        formulariosSci: true,
        periodosOperacionales: true,
      },
    });

    if (!incidente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(incidente);
  } catch (error) {
    console.error('Error en GET /api/incidentes/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener incidente' },
      { status: 500 }
    );
  }
}

// PUT /api/incidentes/[id]
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
        { error: 'No tienes permisos para editar' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = updateIncidentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const existente = await prisma.incidente.findUnique({
      where: { idIncidente: idNumero },
    });
    if (!existente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
    }
    if (existente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'Solo se pueden editar incidentes activos' },
        { status: 400 }
      );
    }

    const actualizado = await prisma.incidente.update({
      where: { idIncidente: idNumero },
      data: {
        ...result.data,
        fechaModificacion: new Date(),
      },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error('Error en PUT /api/incidentes/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar' },
      { status: 500 }
    );
  }
}

// PATCH /api/incidentes/[id]/cerrar
export async function PATCH(
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
        { error: 'No tienes permisos para cerrar incidentes' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { observaciones } = body;
    if (!observaciones || observaciones.trim().length === 0) {
      return NextResponse.json(
        { error: 'Las observaciones de cierre son obligatorias' },
        { status: 400 }
      );
    }

    const existente = await prisma.incidente.findUnique({
      where: { idIncidente: idNumero },
    });
    if (!existente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
    }
    if (existente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'El incidente ya está cerrado o cancelado' },
        { status: 400 }
      );
    }

    const cerrado = await prisma.incidente.update({
      where: { idIncidente: idNumero },
      data: {
        estado: 'CERRADO',
        fechaHoraCierre: new Date(),
        observacionesCierre: observaciones.trim(),
        idUsuarioCierre: session.user.idUsuario,
      },
    });

    await prisma.asignacionRecurso.updateMany({
      where: {
        idIncidente: idNumero,
        fechaHoraDesmovilizacion: null,
      },
      data: {
        fechaHoraDesmovilizacion: new Date(),
        observacionesDesmovilizacion: 'Liberado automáticamente al cerrar el incidente',
      },
    });

    return NextResponse.json(cerrado);
  } catch (error) {
    console.error('Error en PATCH /api/incidentes/[id]/cerrar:', error);
    return NextResponse.json(
      { error: 'Error al cerrar incidente' },
      { status: 500 }
    );
  }
}
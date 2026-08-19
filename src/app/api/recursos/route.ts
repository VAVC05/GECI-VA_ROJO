import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Esquema de validación para crear un recurso
const createRecursoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  clase: z.string().min(1, 'La clase es obligatoria'), // Personal, Vehículo, Equipo
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  institucion: z.string().optional(),
  matricula: z.string().optional(),
  numeroPersonas: z.number().int().min(0).optional(),
});

// GET /api/recursos - Listar recursos (con filtros)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const clase = searchParams.get('clase');
    const tipo = searchParams.get('tipo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (estado) where.estado = estado;
    if (clase) where.clase = clase;
    if (tipo) where.tipo = tipo;

    const [recursos, total] = await Promise.all([
      prisma.recurso.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          asignaciones: {
            where: { fechaHoraDesmovilizacion: null },
            include: {
              incidente: {
                select: { idIncidente: true, folio: true, nombre: true },
              },
            },
          },
        },
      }),
      prisma.recurso.count({ where }),
    ]);

    return NextResponse.json({
      recursos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error en GET /api/recursos:', error);
    return NextResponse.json(
      { error: 'Error al obtener recursos' },
      { status: 500 }
    );
  }
}

// POST /api/recursos - Crear un nuevo recurso
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo Administrador puede crear recursos
    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear recursos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createRecursoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const { nombre, clase, tipo, institucion, matricula, numeroPersonas } = result.data;

    const nuevoRecurso = await prisma.recurso.create({
      data: {
        nombre,
        clase,
        tipo,
        institucion,
        matricula,
        numeroPersonas,
        estado: 'DISPONIBLE', // Siempre empieza disponible
      },
    });

    return NextResponse.json(nuevoRecurso, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/recursos:', error);
    return NextResponse.json(
      { error: 'Error al crear recurso' },
      { status: 500 }
    );
  }
}
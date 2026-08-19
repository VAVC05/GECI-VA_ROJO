import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Esquema de validación para crear una víctima
const createVictimaSchema = z.object({
  idIncidente: z.number().int(),
  nombrePaciente: z.string().optional(),
  sexo: z.string().optional(),
  edad: z.number().int().min(0).optional(),
  lugarRegistro: z.string().min(1, 'El lugar de registro es obligatorio'),
  notasAdicionales: z.string().optional(),
});

// GET /api/victimas - Listar víctimas (con filtro por incidente)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idIncidente = searchParams.get('idIncidente');
    const estado = searchParams.get('estado');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (idIncidente) where.idIncidente = parseInt(idIncidente);
    if (estado) where.estadoAtencion = estado;

    const [victimas, total] = await Promise.all([
      prisma.victima.findMany({
        where,
        orderBy: { fechaHoraRegistro: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
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
      }),
      prisma.victima.count({ where }),
    ]);

    return NextResponse.json({
      victimas,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error en GET /api/victimas:', error);
    return NextResponse.json(
      { error: 'Error al obtener víctimas' },
      { status: 500 }
    );
  }
}

// POST /api/victimas - Crear una nueva víctima
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos: Jefe Paramédicos, Personal Operativo o Administrador
    const rolesPermitidos = ['Administrador', 'Jefe Paramedicos', 'Personal Operativo'];
    if (!rolesPermitidos.includes(session.user?.rol || '')) {
      return NextResponse.json(
        { error: 'No tienes permisos para registrar víctimas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createVictimaSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const {
      idIncidente,
      nombrePaciente,
      sexo,
      edad,
      lugarRegistro,
      notasAdicionales,
    } = result.data;

    // Verificar que el incidente existe y está activo
    const incidente = await prisma.incidente.findUnique({
      where: { idIncidente },
    });
    if (!incidente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
    }
    if (incidente.estado !== 'ACTIVO') {
      return NextResponse.json(
        { error: 'No se pueden registrar víctimas en incidentes cerrados' },
        { status: 400 }
      );
    }

    const nuevaVictima = await prisma.victima.create({
      data: {
        idIncidente,
        nombrePaciente,
        sexo,
        edad,
        lugarRegistro,
        notasAdicionales,
        idUsuarioRegistro: session.user.idUsuario,
        estadoAtencion: 'EN_ESPERA', // Estado inicial
      },
      include: {
        usuarioRegistro: {
          select: { nombreCompleto: true, correo: true },
        },
      },
    });

    return NextResponse.json(nuevaVictima, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/victimas:', error);
    return NextResponse.json(
      { error: 'Error al crear víctima' },
      { status: 500 }
    );
  }
}
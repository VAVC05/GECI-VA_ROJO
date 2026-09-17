import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const createIncidentSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    tipo: z.string().min(1, 'El tipo es obligatorio'),
    lugar: z.string().min(1, 'El lugar es obligatorio'),
    fechaHoraInicio: z.string().datetime({ message: 'Fecha inválida' }),
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

// Lista incidentes y creacin de filtros
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const estado = searchParams.get('estado');
        const tipo = searchParams.get('tipo');

        const where: Prisma.IncidenteWhereInput = {};
        if (estado) where.estado = estado as Prisma.EnumEstadoIncidenteFilter['equals'];
        if (tipo) where.tipo = tipo;

        const [incidentes, total] = await Promise.all([
            prisma.incidente.findMany({
                where,
                orderBy: { fechaHoraInicio: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    usuarioRegistro: {
                        select: { nombreCompleto: true, correo: true },
                    },
                },
            }),
            prisma.incidente.count({ where }),
        ]);

        return NextResponse.json({
            incidentes,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error en GET /api/incidentes:', error);
        return NextResponse.json(
            { error: 'Error al obtener incidentes' },
            { status: 500 }
        );
    }
}

// Crea un nuevo incidente
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const rolesPermitidos = ['Administrador', 'Tecnico Operativo', 'Jefe Bomberos', 'Jefe Paramedicos'];
        if (!rolesPermitidos.includes(session.user?.rol || '')) {
            return NextResponse.json(
                { error: 'No tienes permisos para crear incidentes' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const result = createIncidentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.issues },
                { status: 400 }
            );
        }

        const {
            nombre,
            tipo,
            lugar,
            fechaHoraInicio,
            amenazasPresentes,
            areasAfectadas,
            objetivoInicial,
            ubicacionPc,
            ubicacionAe,
            rutaIngreso,
            rutaEgreso,
            mensajeSeguridad,
            canalesComunicacion,
        } = result.data;

        // Genera  folio  consecutivo 
        const hoy = new Date();
        const anio = hoy.getFullYear();

        const ultimo = await prisma.incidente.findFirst({
            where: { folio: { startsWith: `GECI-${anio}-` } },
            orderBy: { folio: 'desc' },
        });

        let consecutivo = 1;
        if (ultimo) {
            const partes = ultimo.folio.split('-');
            const num = parseInt(partes[2], 10);
            if (!Number.isNaN(num)) {
                consecutivo = num + 1;
            }
        }

        let folio = `GECI-${anio}-${String(consecutivo).padStart(5, '0')}`;
        let nuevoIncidente = null;
        let intentos = 0;

        while (intentos < 3 && !nuevoIncidente) {
            try {
                nuevoIncidente = await prisma.incidente.create({
                    data: {
                        folio,
                        nombre,
                        tipo,
                        lugar,
                        fechaHoraInicio: new Date(fechaHoraInicio),
                        amenazasPresentes,
                        areasAfectadas,
                        objetivoInicial,
                        ubicacionPc,
                        ubicacionAe,
                        rutaIngreso,
                        rutaEgreso,
                        mensajeSeguridad,
                        canalesComunicacion,
                        estado: 'ACTIVO',
                        idUsuarioRegistro: session.user.idUsuario,
                    },
                });
            } catch (err) {
                intentos++;
                const esColision = err instanceof Error && err.message.includes('Unique constraint');
                if (!esColision || intentos >= 3) throw err;
                consecutivo++;
                folio = `GECI-${anio}-${String(consecutivo).padStart(5, '0')}`;
            }
        }

        return NextResponse.json(nuevoIncidente, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/incidentes:', error);
        return NextResponse.json(
            { error: 'Error al crear incidente' },
            { status: 500 }
        );
    }
}
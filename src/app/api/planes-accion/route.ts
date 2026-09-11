import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const createPlanSchema = z.object({
    idIncidente: z.number().int(),
    idPeriodo: z.number().int(),
    objetivosOperacionales: z.string().min(1, 'Los objetivos son obligatorios'),
    estrategias: z.string().optional(),
    tacticas: z.string().optional(),
    recursosEnLugar: z.string().optional(),
    recursosPorSolicitar: z.string().optional(),
    mensajeSeguridad: z.string().optional(),
    nombreJefePlanificacion: z.string().optional(),
});

// GET /api/planes-accion - Lista planes de acción con filtro por incidente
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const idIncidente = searchParams.get('idIncidente');

        const where: Prisma.PlanAccionWhereInput = {};
        if (idIncidente) where.idIncidente = parseInt(idIncidente);

        const planes = await prisma.planAccion.findMany({
            where,
            orderBy: { fechaHoraPreparacion: 'desc' },
            include: {
                incidente: {
                    select: { idIncidente: true, folio: true, nombre: true },
                },
                periodo: {
                    select: { idPeriodo: true, numeroPeriodo: true, fechaHoraInicio: true, fechaHoraFin: true },
                },
            },
        });

        return NextResponse.json(planes);
    } catch (error) {
        console.error('Error en GET /api/planes-accion:', error);
        return NextResponse.json(
            { error: 'Error al obtener planes de acción' },
            { status: 500 }
        );
    }
}

// POST /api/planes-accion - Crea un nuevo plan de acción
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const rolesPermitidos = ['Administrador', 'Tecnico Operativo'];
        if (!rolesPermitidos.includes(session.user?.rol || '')) {
            return NextResponse.json(
                { error: 'No tienes permisos para crear planes de acción' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const result = createPlanSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.issues },
                { status: 400 }
            );
        }

        const {
            idIncidente,
            idPeriodo,
            objetivosOperacionales,
            estrategias,
            tacticas,
            recursosEnLugar,
            recursosPorSolicitar,
            mensajeSeguridad,
            nombreJefePlanificacion,
        } = result.data;

        const incidente = await prisma.incidente.findUnique({
            where: { idIncidente },
        });
        if (!incidente) {
            return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
        }
        if (incidente.estado !== 'ACTIVO') {
            return NextResponse.json(
                { error: 'Solo se pueden crear planes para incidentes activos' },
                { status: 400 }
            );
        }

        const periodo = await prisma.periodoOperacional.findUnique({
            where: { idPeriodo },
        });
        if (!periodo) {
            return NextResponse.json({ error: 'Periodo operacional no encontrado' }, { status: 404 });
        }
        if (periodo.idIncidente !== idIncidente) {
            return NextResponse.json(
                { error: 'El periodo no pertenece a este incidente' },
                { status: 400 }
            );
        }

        const paiExistente = await prisma.planAccion.findUnique({
            where: { idPeriodo },
        });
        if (paiExistente) {
            return NextResponse.json(
                { error: 'Ya existe un plan de acción para este periodo operacional' },
                { status: 400 }
            );
        }

        const nuevoPlan = await prisma.planAccion.create({
            data: {
                idIncidente,
                idPeriodo,
                objetivosOperacionales,
                estrategias,
                tacticas,
                recursosEnLugar,
                recursosPorSolicitar,
                mensajeSeguridad,
                nombreJefePlanificacion,
            },
            include: {
                incidente: {
                    select: { idIncidente: true, folio: true, nombre: true },
                },
                periodo: {
                    select: { idPeriodo: true, numeroPeriodo: true, fechaHoraInicio: true, fechaHoraFin: true },
                },
            },
        });

        return NextResponse.json(nuevoPlan, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/planes-accion:', error);
        return NextResponse.json(
            { error: 'Error al crear plan de acción' },
            { status: 500 }
        );
    }
}
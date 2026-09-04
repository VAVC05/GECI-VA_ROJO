import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/roles - Listar todos los roles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo Administrador puede ver roles (para crear usuarios)
    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos' },
        { status: 403 }
      );
    }

    const roles = await prisma.rol.findMany({
      select: {
        idRol: true,
        nombre: true,
        descripcion: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error en GET /api/roles:', error);
    return NextResponse.json(
      { error: 'Error al obtener roles' },
      { status: 500 }
    );
  }
}
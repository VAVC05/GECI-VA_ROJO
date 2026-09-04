import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const estadoSchema = z.object({
  estado: z.boolean(),
});

// PATCH /api/usuarios/[id]/estado - Activar o desactivar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo Administrador puede cambiar estado
    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para cambiar el estado de usuarios' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = estadoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { idUsuario: idNumero },
    });

    if (!usuarioExistente) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    //  CORREGIDO: usar idUsuario en lugar de id
    if (idNumero === session.user.idUsuario && result.data.estado === false) {
      return NextResponse.json(
        { error: 'No puedes desactivar tu propia cuenta' },
        { status: 400 }
      );
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { idUsuario: idNumero },
      data: { estado: result.data.estado },
      select: {
        idUsuario: true,
        nombreCompleto: true,
        correo: true,
        estado: true,
        rol: {
          select: {
            idRol: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error) {
    console.error('Error en PATCH /api/usuarios/[id]/estado:', error);
    return NextResponse.json(
      { error: 'Error al cambiar estado del usuario' },
      { status: 500 }
    );
  }
}
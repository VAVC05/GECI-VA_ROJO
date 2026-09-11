import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  nombreCompleto: z.string().min(3).optional(),
  idRol: z.number().int().optional(),
  estado: z.boolean().optional(),
});

//  detalle de un usuario
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

    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: idNumero },
      select: {
        idUsuario: true,
        nombreCompleto: true,
        correo: true,
        estado: true,
        fechaRegistro: true,
        fechaUltimoAcceso: true,
        rol: {
          select: {
            idRol: true,
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // usa el idUsuario para verificar si tiene permisos
    if (session.user?.rol !== 'Administrador' && session.user?.idUsuario !== idNumero) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver este usuario' },
        { status: 403 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error en GET /api/usuarios/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

//  Actualizar usuario solo Administrador
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar usuarios' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

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

    if (result.data.idRol) {
      const rolExistente = await prisma.rol.findUnique({
        where: { idRol: result.data.idRol },
      });
      if (!rolExistente) {
        return NextResponse.json(
          { error: 'El rol especificado no existe' },
          { status: 400 }
        );
      }
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { idUsuario: idNumero },
      data: result.data,
      select: {
        idUsuario: true,
        nombreCompleto: true,
        correo: true,
        estado: true,
        fechaRegistro: true,
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
    console.error('Error en PUT /api/usuarios/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

// Eliminar usuario solo Administrador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar usuarios' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    //  usa idUsuario para eliminar usuario
    if (idNumero === session.user.idUsuario) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { idUsuario: idNumero },
    });

    if (!usuarioExistente) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    await prisma.usuario.delete({
      where: { idUsuario: idNumero },
    });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/usuarios/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
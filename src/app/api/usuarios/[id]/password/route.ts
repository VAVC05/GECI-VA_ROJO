import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const passwordSchema = z.object({
  contrasenaActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  contrasenaNueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

//  Cambiar contraseña por el propio usuario
export async function PATCH(
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

    // usa idUsuario para cambiar contraseña
    if (session.user?.idUsuario !== idNumero && session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para cambiar esta contraseña' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = passwordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const { contrasenaActual, contrasenaNueva } = result.data;

    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: idNumero },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    //verificar la contraseña actual
    if (session.user?.rol !== 'Administrador') {
      const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasenaHash);
      if (!contrasenaValida) {
        return NextResponse.json(
          { error: 'La contraseña actual es incorrecta' },
          { status: 400 }
        );
      }
    }

    // Hash de la nueva contraseña
    const nuevaContrasenaHash = await bcrypt.hash(contrasenaNueva, 10);

    await prisma.usuario.update({
      where: { idUsuario: idNumero },
      data: { contrasenaHash: nuevaContrasenaHash },
    });

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en PATCH /api/usuarios/[id]/password:', error);
    return NextResponse.json(
      { error: 'Error al cambiar contraseña' },
      { status: 500 }
    );
  }
}
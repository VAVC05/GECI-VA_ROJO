import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Esquema de validación para crear usuario (solo Administrador)
const createUserSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre completo es obligatorio'),
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  idRol: z.number().int().min(1, 'El rol es obligatorio'),
});

// GET /api/usuarios - Listar todos los usuarios (solo Administrador)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo Administrador puede listar usuarios
    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para ver usuarios' },
        { status: 403 }
      );
    }

    const usuarios = await prisma.usuario.findMany({
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
      orderBy: { nombreCompleto: 'asc' },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error en GET /api/usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST /api/usuarios - Crear un nuevo usuario (solo Administrador)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo Administrador puede crear usuarios
    if (session.user?.rol !== 'Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear usuarios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const { nombreCompleto, correo, contrasena, idRol } = result.data;

    // Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo },
    });
    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar que el rol existe
    const rolExistente = await prisma.rol.findUnique({
      where: { idRol },
    });
    if (!rolExistente) {
      return NextResponse.json(
        { error: 'El rol especificado no existe' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombreCompleto,
        correo,
        contrasenaHash,
        idRol,
        estado: true,
      },
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

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/usuarios:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
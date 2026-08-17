import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Minutos de inactividad antes de que la sesión expire (RNF-01).
// NextAuth con estrategia JWT no tiene un temporizador de "inactividad"
// como tal: lo que hacemos es que el token dura estos mismos minutos, y
// cada vez que el usuario hace una petición (navega, recarga, etc.)
// NextAuth renueva el token automáticamente. Si el usuario deja de usar
// el sistema por más de este tiempo, el token expira solo y se le pide
// iniciar sesión de nuevo.
const MINUTOS_INACTIVIDAD = Number(process.env.MINUTOS_INACTIVIDAD ?? 30);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: MINUTOS_INACTIVIDAD * 60,
    updateAge: 0, // renueva el token en cada petición, no solo una vez al día
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credenciales",
      credentials: {
        correo: { label: "Correo", type: "email" },
        contrasena: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { correo: credentials.correo },
          include: { rol: true },
        });

        // No decimos si el problema fue el correo o la contraseña, para
        // no darle pistas a alguien que esté intentando adivinar.
        if (!usuario || !usuario.estado) {
          return null;
        }

        const contrasenaValida = await bcrypt.compare(
          credentials.contrasena,
          usuario.contrasenaHash
        );

        if (!contrasenaValida) {
          return null;
        }

        // Registramos el momento del acceso, tal como pide el módulo de
        // auditoría (RNF-10).
        await prisma.usuario.update({
          where: { idUsuario: usuario.idUsuario },
          data: { fechaUltimoAcceso: new Date() },
        });

        return {
          id: String(usuario.idUsuario),
          name: usuario.nombreCompleto,
          email: usuario.correo,
          rol: usuario.rol.nombre,
        };
      },
    }),
  ],
  callbacks: {
    // Lo que regresa authorize() se guarda aquí dentro del JWT.
    async jwt({ token, user }) {
      if (user) {
        token.rol = (user as { rol: string }).rol;
      }
      return token;
    },
    // Y de aquí se copia a la sesión que ve el resto de la aplicación.
    async session({ session, token }) {
      if (session.user) {
        session.user.rol = token.rol as string;
      }
      return session;
    },
  },
};

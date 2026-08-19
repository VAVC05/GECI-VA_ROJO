import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Minutos de inactividad (RNF-01)
const MINUTOS_INACTIVIDAD = Number(process.env.MINUTOS_INACTIVIDAD ?? 30);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: MINUTOS_INACTIVIDAD * 60,
    updateAge: 0, // renueva el token en cada petición
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

        // Actualizar último acceso (RNF-10)
        await prisma.usuario.update({
          where: { idUsuario: usuario.idUsuario },
          data: { fechaUltimoAcceso: new Date() },
        });

        // Devolvemos el usuario incluyendo idUsuario y rol.
        // NextAuth espera 'id' como string, pero nosotros guardamos también el número.
        return {
          id: String(usuario.idUsuario),
          idUsuario: usuario.idUsuario, // ← guardamos el número para uso interno
          name: usuario.nombreCompleto,
          email: usuario.correo,
          rol: usuario.rol.nombre,
        };
      },
    }),
  ],
  callbacks: {
    // jwt: se ejecuta al crear/actualizar el token JWT
    async jwt({ token, user }) {
      if (user) {
        // Guardamos idUsuario y rol en el token
        token.idUsuario = (user as any).idUsuario;
        token.rol = (user as any).rol;
      }
      return token;
    },
    // session: se ejecuta al obtener la sesión (cada vez que se llama a getServerSession)
    async session({ session, token }) {
      if (session.user) {
        // Pasamos idUsuario y rol del token a la sesión
        (session.user as any).idUsuario = token.idUsuario;
        (session.user as any).rol = token.rol;
      }
      return session;
    },
  },
};
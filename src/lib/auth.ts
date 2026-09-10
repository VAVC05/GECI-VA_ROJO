import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// inactividad en minutos antes de que la sesión expire 
const MINUTOS_INACTIVIDAD = Number(process.env.MINUTOS_INACTIVIDAD ?? 30);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: MINUTOS_INACTIVIDAD * 60,
    updateAge: 0, //  evita expiración por inactividad.
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

        // Busca el usuario por correo incluyendo su rol.
        const usuario = await prisma.usuario.findUnique({
          where: { correo: credentials.correo },
          include: { rol: true },
        });

        // Si el usuario no existe o está inactivo, deniega el acceso.
        if (!usuario || !usuario.estado) {
          return null;
        }

        // Compara la contraseña ingresada con el hash almacenado.
        const contrasenaValida = await bcrypt.compare(
          credentials.contrasena,
          usuario.contrasenaHash
        );

        if (!contrasenaValida) {
          return null;
        }

        // Registra la fecha del último acceso 
        await prisma.usuario.update({
          where: { idUsuario: usuario.idUsuario },
          data: { fechaUltimoAcceso: new Date() },
        });

        // Devuelve el objeto de usuario que NextAuth almacenará en el JWT.
        return {
          id: String(usuario.idUsuario),
          idUsuario: usuario.idUsuario,
          name: usuario.nombreCompleto,
          email: usuario.correo,
          rol: usuario.rol.nombre,
        };
      },
    }),
  ],
  callbacks: {
    // Se ejecuta al crear o actualizar el JWT. Copia los datos del usuario al token.
    async jwt({ token, user }) {
      if (user) {
        token.idUsuario = (user as any).idUsuario;
        token.rol = (user as any).rol;
      }
      return token;
    },
    // Se ejecuta al obtener la sesión. Transfiere los datos del token a la sesión.
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).idUsuario = token.idUsuario;
        (session.user as any).rol = token.rol;
      }
      return session;
    },
  },
};
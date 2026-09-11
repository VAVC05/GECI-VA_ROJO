import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MINUTOS_INACTIVIDAD = Number(process.env.MINUTOS_INACTIVIDAD ?? 30);

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: MINUTOS_INACTIVIDAD * 60,
        updateAge: 0,
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

                await prisma.usuario.update({
                    where: { idUsuario: usuario.idUsuario },
                    data: { fechaUltimoAcceso: new Date() },
                });

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
        async jwt({ token, user }) {
            if (user) {
                token.idUsuario = user.idUsuario;
                token.rol = user.rol;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.idUsuario = token.idUsuario as number;
                session.user.rol = token.rol as string;
            }
            return session;
        },
    },
};
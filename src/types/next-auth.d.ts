import "next-auth";
import "next-auth/jwt";

// Este archivo no exporta nada que se use directamente: solo le dice a
// TypeScript "el objeto de sesión y el token de NextAuth también traen
// un campo `rol`", porque por defecto NextAuth no lo sabe.
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      rol: string;
    };
  }

  interface User {
    rol: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: string;
  }
}

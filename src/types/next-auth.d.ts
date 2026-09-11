import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      rol: string;
      idUsuario: number; // agregamos idUsuario
    };
  }

  interface User {
    rol: string;
    idUsuario: number; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: string;
    idUsuario?: number; 
  }
}
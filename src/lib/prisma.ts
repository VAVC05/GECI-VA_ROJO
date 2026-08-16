import { PrismaClient } from "@prisma/client";

// En un entorno serverless como Vercel, cada invocación de una función
// podría crear su propia instancia de PrismaClient si no se controla
// esto, y eso agota las conexiones disponibles de Postgres muy rápido.
// Por eso el cliente se guarda en globalThis: en desarrollo el proceso
// de Node se mantiene vivo entre recargas (hot reload) y reutiliza la
// misma instancia; en producción cada invocación fría crea una nueva,
// pero dentro de la misma invocación cálida se reutiliza.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

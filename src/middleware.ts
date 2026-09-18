import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirige al login si no hay sesión activa y la ruta no es pública.
    if (!token) {
      if (path.startsWith("/api/") || path === "/login") {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Control de acceso basado en roles: solo Administrador puede acceder a /admin/*.
    if (path.startsWith("/admin") && token.rol !== "Administrador") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        // Permitir siempre el acceso a recursos estáticos y rutas públicas,
        // incluso sin sesión.
        if (
          path.startsWith("/logos/") ||
          path.startsWith("/img/") ||
          path.startsWith("/_next/") ||
          path === "/favicon.ico" ||
          path === "/login" ||
          path.startsWith("/api/auth/")
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

// Configuración de rutas protegidas excluye las públicas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api/auth (rutas de autenticación)
     * - api (resto de endpoints, validan sesión internamente)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - login (página pública)
     * - logos (logos institucionales)
     * - img (imágenes generales)
     */
    "/((?!api/auth|api|_next/static|_next/image|favicon.ico|login|logos|img).*)",
  ],
};
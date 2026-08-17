import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// withAuth ya se encarga de la parte básica: si no hay sesión, redirige
// a /login automáticamente. Aquí encima le agregamos la regla de que
// solo el Administrador puede entrar a las rutas que empiezan con
// /admin — así es como se ve un control de acceso por rol (RBAC) en la
// práctica: no basta con "¿tiene sesión?", también hay que preguntar
// "¿tiene el rol correcto para ESTA página en particular?".
export default withAuth(
  function middleware(req) {
    const rol = req.nextauth.token?.rol;
    const rutaEsDeAdmin = req.nextUrl.pathname.startsWith("/admin");

    if (rutaEsDeAdmin && rol !== "Administrador") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Esto solo confirma que exista un token (sesión activa). La
      // lógica de rol específica ya la resolvimos arriba.
      authorized: ({ token }) => !!token,
    },
  }
);

// Aquí se listan exactamente qué rutas pasan por el middleware. Todo lo
// que NO esté aquí (como /login o la página de inicio) queda fuera de
// esta protección, tal como debe ser.
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

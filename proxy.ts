import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy function para Next.js 16
 * Reemplaza al middleware tradicional con mejor nomenclatura
 * Maneja autenticación y redirecciones de forma centralizada
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas protegidas que requieren autenticación
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Rutas públicas donde usuarios autenticados no deberían estar
    const publicRoutes = ['/login'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Verificar token de sesión (soporta ambos prefijos: estándar y seguro)
    const sessionToken = request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    // Redirigir a login si intenta acceder a ruta protegida sin autenticación
    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redirigir a dashboard si usuario autenticado intenta acceder a login
    if (isPublicRoute && sessionToken && pathname === '/login') {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

/**
 * Configuración del proxy
 * Excluye archivos estáticos, API routes de Next.js y assets
 */
export const config = {
    matcher: [
        /*
         * Match todas las rutas excepto:
         * - API routes (_next, api)
         * - Archivos estáticos (*.png, *.jpg, etc.)
         * - Favicon y otros assets
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

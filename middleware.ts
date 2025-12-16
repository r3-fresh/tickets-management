import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the user is trying to access the dashboard
    if (pathname.startsWith("/dashboard")) {
        // Better-auth uses this cookie name by default
        const sessionToken = request.cookies.get("better-auth.session_token");

        if (!sessionToken) {
            // Redirect to login if no session token found
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Check admin routes
        if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/agent")) {
            try {
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session?.user || session.user.role !== "admin") {
                    const dashboardUrl = new URL("/dashboard", request.url);
                    return NextResponse.redirect(dashboardUrl);
                }
            } catch (error) {
                console.error("Middleware auth error:", error);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the user is trying to access the dashboard
    if (pathname.startsWith("/dashboard")) {
        // Check for session token (support both standard and secure prefixes)
        const sessionToken = request.cookies.get("better-auth.session_token") ||
            request.cookies.get("__Secure-better-auth.session_token");

        if (!sessionToken) {
            // Redirect to login if no session token found
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Check admin/agent routes
        if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/agent")) {
            try {
                // Fetch session from API (Node.js runtime) to avoid import issues in Edge Middleware
                const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
                    headers: {
                        cookie: request.headers.get("cookie") || "",
                    },
                });
                const session = await response.json();

                if (!session?.user) {
                    return NextResponse.redirect(new URL("/login", request.url));
                }

                const role = session.user.role;

                // Protect Admin Routes
                if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
                    const dashboardUrl = new URL("/dashboard", request.url);
                    return NextResponse.redirect(dashboardUrl);
                }

                // Protect Agent Routes (Managers/Admins allowed)
                if (pathname.startsWith("/dashboard/agent") && role !== "agent" && role !== "admin") {
                    const dashboardUrl = new URL("/dashboard", request.url);
                    return NextResponse.redirect(dashboardUrl);
                }

            } catch (error) {
                console.error("Middleware auth error:", error);
                // On error, maybe allow to proceed or redirect to safe page?
                // Let's allow proceed to avoid locking out if API fails, page guard will handle it.
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};

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
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};

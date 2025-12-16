
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the user is trying to access the dashboard
    if (pathname.startsWith("/dashboard")) {
        // Better-auth uses this cookie name by default
        const sessionToken = request.cookies.get("better-auth.session_token") || request.cookies.get("better-auth.session_token.sig");

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

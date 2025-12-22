import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AppSession } from "@/types";

/**
 * Gets the current session if it exists
 * @returns Session object or null if not authenticated
 */
export async function getSession(): Promise<AppSession | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session as AppSession | null;
}

/**
 * Requires authentication. Redirects if user is not authenticated or is inactive.
 * @returns Session object
 * @throws Redirects if not authenticated or user is deactivated
 */
export async function requireAuth(): Promise<AppSession> {
    const session = await getSession();

    if (!session?.user) {
        redirect("/auth/signin?error=unauthorized");
    }

    // Check if user is active
    if (!session.user.isActive) {
        redirect("/auth/signin?error=user_deactivated");
    }

    return session;
}

/**
 * Requires admin role. Redirects if user is not an admin.
 * @returns Session object with admin user
 * @throws Redirects if not authenticated or not an admin
 */
export async function requireAdmin(): Promise<AppSession> {
    const session = await requireAuth();

    if (session.user.role !== "admin") {
        redirect("/dashboard?error=forbidden");
    }

    return session;
}

/**
 * Checks if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
    const session = await getSession();
    return session?.user?.role === "admin";
}

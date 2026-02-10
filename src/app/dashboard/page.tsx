import { Suspense } from "react";
import { getSession } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { AgentDashboard } from "@/components/dashboards/agent-dashboard";
import { UserDashboard } from "@/components/dashboards/user-dashboard";

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-72 animate-pulse rounded bg-muted" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
    );
}

export default async function DashboardRootPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/login");
    }

    // Direct render based on role - NO redirects for instant loading
    if (session.user.role === "admin") {
        return (
            <Suspense fallback={<DashboardSkeleton />}>
                <AdminDashboard />
            </Suspense>
        );
    }

    if (session.user.role === "agent") {
        // Check if agent has area assigned
        if (!session.user.attentionAreaId) {
            return (
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Error de configuración</h1>
                    <p className="mt-2 text-gray-600">
                        Tu usuario tiene rol de agente pero no tiene un área de atención asignada.
                        Contacta al administrador.
                    </p>
                </div>
            );
        }

        return (
            <Suspense fallback={<DashboardSkeleton />}>
                <AgentDashboard 
                    userId={session.user.id} 
                    attentionAreaId={session.user.attentionAreaId} 
                />
            </Suspense>
        );
    }

    // Regular users
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <UserDashboard userId={session.user.id} />
        </Suspense>
    );
}

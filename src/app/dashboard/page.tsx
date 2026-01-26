import { getSession } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role === "admin") {
        redirect("/dashboard/admin");
    }

    if (session.user.role === "agent") {
        redirect("/dashboard/agente");
    }

    // Regular users go to their dashboard
    redirect("/dashboard/usuario");
}

// Loading state shown during redirect
export function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
        </div>
    );
}

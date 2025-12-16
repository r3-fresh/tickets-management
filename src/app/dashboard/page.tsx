import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Redirect users to their tickets list
    if (session?.user && (session.user as any).role !== "admin") {
        redirect("/dashboard/tickets");
    }

    // Admin dashboard
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Administración</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Tickets Abiertos</h3>
                        <p className="text-sm text-muted-foreground">Tickets pendientes de atención</p>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">Ver Bandeja</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { getSession } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { AgentDashboard } from "@/components/dashboards/agent-dashboard";
import { UserDashboard } from "@/components/dashboards/user-dashboard";

export default async function DashboardRootPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/login");
    }

    // Direct render based on role - NO redirects for instant loading
    if (session.user.role === "admin") {
        return <AdminDashboard />;
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
            <AgentDashboard 
                userId={session.user.id} 
                attentionAreaId={session.user.attentionAreaId} 
            />
        );
    }

    // Regular users
    return <UserDashboard userId={session.user.id} />;
}

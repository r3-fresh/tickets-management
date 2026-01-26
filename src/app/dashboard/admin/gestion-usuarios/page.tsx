import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { RolesTable } from "@/components/admin/roles-table";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default async function AdminRolesPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const allUsers = await db.select()
        .from(users)
        .orderBy(desc(users.createdAt));

    const { getActiveAttentionAreas } = await import("@/actions/config/get-config");
    const attentionAreas = await getActiveAttentionAreas();

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Gestión de usuarios" }]} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de usuarios</h1>
                <p className="text-muted-foreground mt-1">Administra los roles de los usuarios del sistema</p>
            </div>

            <RolesTable
                users={allUsers}
                currentUserId={session.user.id}
                attentionAreas={attentionAreas}
            />
        </div>
    );
}

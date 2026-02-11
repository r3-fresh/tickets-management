import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/helpers";
import { desc } from "drizzle-orm";
import { RolesTable } from "@/components/admin/roles-table";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestión de usuarios",
};

export default async function UsuariosPage() {
    // Authorization handled by (admin) layout
    const session = await getSession();
    if (!session?.user) return null;

    // Both queries are independent — run in parallel
    const { getActiveAttentionAreas } = await import("@/actions/config/get-config");
    const [allUsers, attentionAreas] = await Promise.all([
        db.select()
            .from(users)
            .orderBy(desc(users.createdAt)),
        getActiveAttentionAreas(),
    ]);

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

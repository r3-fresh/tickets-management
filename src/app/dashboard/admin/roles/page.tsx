import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { RolesTable } from "@/components/admin/roles-table";

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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>
            <p className="text-muted-foreground">Administra los roles de los usuarios del sistema.</p>
            <RolesTable users={allUsers} currentUserId={session.user.id} />
        </div>
    );
}

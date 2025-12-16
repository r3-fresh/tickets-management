"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: "user" | "admin") {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        return { error: "No autorizado" };
    }

    try {
        await db.update(users)
            .set({ role: newRole, updatedAt: new Date() })
            .where(eq(users.id, userId));

        revalidatePath("/dashboard/admin/roles");
        return { success: true };
    } catch (error) {
        console.error("Error updating role:", error);
        return { error: "Error al actualizar el rol" };
    }
}

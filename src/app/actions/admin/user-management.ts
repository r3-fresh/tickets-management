"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types";

export async function updateUserRole(userId: string, newRole: UserRole) {
    await requireAdmin();

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

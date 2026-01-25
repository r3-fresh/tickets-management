"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Toggle user active status (activate/deactivate)
 */
export async function toggleUserActive(userId: string, isActive: boolean) {
    const session = await requireAdmin();

    try {
        // Prevent self-deactivation
        if (userId === session.user.id && !isActive) {
            return { error: "No puedes desactivar tu propia cuenta" };
        }

        const updateData: Record<string, any> = {
            isActive,
            updatedAt: new Date(),
        };

        if (!isActive) {
            // Deactivating user
            updateData.deactivatedAt = new Date();
            updateData.deactivatedBy = session.user.id;
        } else {
            // Reactivating user
            updateData.deactivatedAt = null;
            updateData.deactivatedBy = null;
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        revalidatePath("/dashboard/admin/gestion-usuarios");
        return { success: true };
    } catch (error) {
        console.error("Error toggling user active status:", error);
        return { error: "Error al cambiar el estado del usuario" };
    }
}

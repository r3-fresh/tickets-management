"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types";

export async function updateUserRole(userId: string, newRole: string, attentionAreaId?: number | null) {
    const session = await requireAdmin();

    try {
        // Validate role
        if (!["user", "admin", "agent"].includes(newRole)) {
            return { error: "Rol inválido" };
        }

        // Validate attentionAreaId if role is agent
        if (newRole === "agent" && !attentionAreaId) {
            return { error: "Se requiere un área de atención para el agente" };
        }

        await db.update(users)
            .set({
                role: newRole as "user" | "admin" | "agent",
                attentionAreaId: newRole === "agent" ? attentionAreaId : null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        revalidatePath("/dashboard/admin/gestion-usuarios");
        return { success: true };
    } catch (error) {
        console.error("Error updating role:", error);
        return { error: "Error al actualizar el rol" };
    }
}

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

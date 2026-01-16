"use server";

import { db } from "@/db";
import { ticketCategories } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

// Create category (agent-specific)
export async function createAgentCategory(formData: FormData) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "true";

    if (!name?.trim()) {
        return { error: "El nombre es requerido" };
    }

    try {
        // Get current max display order
        const maxOrder = await db.query.ticketCategories.findFirst({
            where: eq(ticketCategories.attentionAreaId, session.user.attentionAreaId),
            orderBy: (categories, { desc }) => [desc(categories.displayOrder)],
            columns: { displayOrder: true },
        });

        await db.insert(ticketCategories).values({
            name: name.trim(),
            description: description?.trim() || null,
            isActive,
            attentionAreaId: session.user.attentionAreaId,
            displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
        });

        revalidatePath("/dashboard/agent/settings");
        return { success: true };
    } catch (error) {
        console.error("Error creating category:", error);
        return { error: "Error al crear la categoría" };
    }
}

// Update category (agent-specific)
export async function updateAgentCategory(formData: FormData) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    const id = parseInt(formData.get("id") as string);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "true";

    if (!id || !name?.trim()) {
        return { error: "Datos inválidos" };
    }

    try {
        // Verify category belongs to agent's area
        const category = await db.query.ticketCategories.findFirst({
            where: and(
                eq(ticketCategories.id, id),
                eq(ticketCategories.attentionAreaId, session.user.attentionAreaId)
            ),
        });

        if (!category) {
            return { error: "Categoría no encontrada o no autorizada" };
        }

        await db.update(ticketCategories)
            .set({
                name: name.trim(),
                description: description?.trim() || null,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(ticketCategories.id, id));

        revalidatePath("/dashboard/agent/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
        return { error: "Error al actualizar la categoría" };
    }
}

// Delete category (agent-specific)
export async function deleteAgentCategory(id: number) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    try {
        // Verify category belongs to agent's area
        const category = await db.query.ticketCategories.findFirst({
            where: and(
                eq(ticketCategories.id, id),
                eq(ticketCategories.attentionAreaId, session.user.attentionAreaId)
            ),
        });

        if (!category) {
            return { error: "Categoría no encontrada o no autorizada" };
        }

        await db.delete(ticketCategories).where(eq(ticketCategories.id, id));

        revalidatePath("/dashboard/agent/settings");
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { error: "Error al eliminar la categoría" };
    }
}

// Toggle active status (agent-specific)
export async function toggleAgentCategoryActive(id: number, newState: boolean) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    try {
        // Verify category belongs to agent's area
        const category = await db.query.ticketCategories.findFirst({
            where: and(
                eq(ticketCategories.id, id),
                eq(ticketCategories.attentionAreaId, session.user.attentionAreaId)
            ),
        });

        if (!category) {
            return { error: "Categoría no encontrada o no autorizada" };
        }

        await db.update(ticketCategories)
            .set({ isActive: newState, updatedAt: new Date() })
            .where(eq(ticketCategories.id, id));

        revalidatePath("/dashboard/agent/settings");
        return { success: true };
    } catch (error) {
        console.error("Error toggling category:", error);
        return { error: "Error al cambiar estado" };
    }
}

"use server";

import { db } from "@/db";
import { ticketSubcategories, ticketCategories } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to verify category belongs to agent's area
async function verifyCategoryOwnership(categoryId: number, agentAreaId: number) {
    const category = await db.query.ticketCategories.findFirst({
        where: and(
            eq(ticketCategories.id, categoryId),
            eq(ticketCategories.attentionAreaId, agentAreaId)
        ),
    });
    return !!category;
}

// Helper to verify subcategory belongs to agent's area
async function verifySubcategoryOwnership(subcategoryId: number, agentAreaId: number) {
    const subcategory = await db.query.ticketSubcategories.findFirst({
        where: eq(ticketSubcategories.id, subcategoryId),
        with: {
            category: true,
        },
    });

    if (!subcategory || !subcategory.category) {
        return false;
    }

    return subcategory.category.attentionAreaId === agentAreaId;
}

export async function createAgentSubcategory(formData: FormData) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    const categoryId = parseInt(formData.get("categoryId") as string);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "true";

    if (!categoryId || !name?.trim()) {
        return { error: "Datos inválidos" };
    }

    try {
        // Verify category belongs to agent's area
        const hasAccess = await verifyCategoryOwnership(categoryId, session.user.attentionAreaId);
        if (!hasAccess) {
            return { error: "No autorizado para esta categoría" };
        }

        // Get max display order for this category
        const result = await db
            .select({ maxOrder: sql<number>`coalesce(max(${ticketSubcategories.displayOrder}), 0)` })
            .from(ticketSubcategories)
            .where(eq(ticketSubcategories.categoryId, categoryId));

        const newOrder = (result[0]?.maxOrder || 0) + 1;

        await db.insert(ticketSubcategories).values({
            categoryId,
            name: name.trim(),
            description: description?.trim() || null,
            isActive,
            displayOrder: newOrder,
        });

        revalidatePath("/dashboard/agente/configuracion");
        return { success: true };
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return { error: "Error al crear subcategoría" };
    }
}

export async function updateAgentSubcategory(formData: FormData) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    const id = parseInt(formData.get("id") as string);
    const categoryId = parseInt(formData.get("categoryId") as string);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "true";

    if (!id || !categoryId || !name?.trim()) {
        return { error: "Datos inválidos" };
    }

    try {
        // Verify subcategory belongs to agent's area
        const hasAccess = await verifySubcategoryOwnership(id, session.user.attentionAreaId);
        if (!hasAccess) {
            return { error: "No autorizado para esta subcategoría" };
        }

        // Verify new category also belongs to agent's area
        const categoryAccess = await verifyCategoryOwnership(categoryId, session.user.attentionAreaId);
        if (!categoryAccess) {
            return { error: "No autorizado para la categoría destino" };
        }

        await db
            .update(ticketSubcategories)
            .set({
                categoryId,
                name: name.trim(),
                description: description?.trim() || null,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/agente/configuracion");
        return { success: true };
    } catch (error) {
        console.error("Error updating subcategory:", error);
        return { error: "Error al actualizar subcategoría" };
    }
}

export async function deleteAgentSubcategory(id: number) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    try {
        // Verify subcategory belongs to agent's area
        const hasAccess = await verifySubcategoryOwnership(id, session.user.attentionAreaId);
        if (!hasAccess) {
            return { error: "No autorizado para esta subcategoría" };
        }

        await db.delete(ticketSubcategories).where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/agente/configuracion");
        return { success: true };
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return { error: "Error al eliminar subcategoría" };
    }
}

export async function toggleAgentSubcategoryActive(id: number, newState: boolean) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    try {
        // Verify subcategory belongs to agent's area
        const hasAccess = await verifySubcategoryOwnership(id, session.user.attentionAreaId);
        if (!hasAccess) {
            return { error: "No autorizado para esta subcategoría" };
        }

        await db
            .update(ticketSubcategories)
            .set({
                isActive: newState,
                updatedAt: new Date(),
            })
            .where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/agente/configuracion");
        return { success: true };
    } catch (error) {
        console.error("Error toggling subcategory:", error);
        return { error: "Error al cambiar estado" };
    }
}

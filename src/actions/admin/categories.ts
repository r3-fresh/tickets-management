"use server";

import { db } from "@/db";
import { ticketCategories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq, sql, gt, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCategory(
    name: string,
    description: string,
    isActive: boolean,
    attentionAreaId?: number
) {
    await requireAdmin();

    try {
        // Get max display order
        const result = await db
            .select({ maxOrder: sql<number>`coalesce(max(${ticketCategories.displayOrder}), 0)` })
            .from(ticketCategories);

        const newOrder = (result[0]?.maxOrder || 0) + 1;

        await db.insert(ticketCategories).values({
            name,
            description: description || null,
            isActive,
            attentionAreaId: attentionAreaId || null,
            displayOrder: newOrder,
        });

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error creating category:", error);
        return { error: "Error al crear categoría" };
    }
}

export async function updateCategory(
    id: number,
    name: string,
    description: string,
    isActive: boolean,
    attentionAreaId?: number
) {
    await requireAdmin();

    try {
        await db
            .update(ticketCategories)
            .set({
                name,
                description: description || null,
                isActive,
                attentionAreaId: attentionAreaId || null,
                updatedAt: new Date(),
            })
            .where(eq(ticketCategories.id, id));

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
        return { error: "Error al actualizar categoría" };
    }
}

export async function deleteCategory(id: number) {
    await requireAdmin();

    try {
        await db.delete(ticketCategories).where(eq(ticketCategories.id, id));

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { error: "Error al eliminar categoría" };
    }
}

export async function toggleCategoryActive(id: number) {
    await requireAdmin();

    try {
        const [updated] = await db
            .update(ticketCategories)
            .set({
                isActive: sql`NOT ${ticketCategories.isActive}`,
                updatedAt: new Date(),
            })
            .where(eq(ticketCategories.id, id))
            .returning({ id: ticketCategories.id });

        if (!updated) {
            return { error: "Categoría no encontrada" };
        }

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error toggling category:", error);
        return { error: "Error al cambiar estado" };
    }
}

export async function moveCategoryUp(id: number, currentOrder: number) {
    await requireAdmin();

    try {
        // Find the category with the previous order
        const prevCategory = await db.query.ticketCategories.findFirst({
            where: lt(ticketCategories.displayOrder, currentOrder),
            orderBy: (categories, { desc }) => [desc(categories.displayOrder)],
        });

        if (!prevCategory) {
            return { error: "No se puede mover más arriba" };
        }

        // Swap orders
        await db
            .update(ticketCategories)
            .set({ displayOrder: prevCategory.displayOrder })
            .where(eq(ticketCategories.id, id));

        await db
            .update(ticketCategories)
            .set({ displayOrder: currentOrder })
            .where(eq(ticketCategories.id, prevCategory.id));

        revalidatePath("/dashboard/admin/configuracion");
        return { success: true };
    } catch (error) {
        console.error("Error moving category:", error);
        return { error: "Error al mover categoría" };
    }
}

export async function moveCategoryDown(id: number, currentOrder: number) {
    await requireAdmin();

    try {
        // Find the category with the next order
        const nextCategory = await db.query.ticketCategories.findFirst({
            where: gt(ticketCategories.displayOrder, currentOrder),
            orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
        });

        if (!nextCategory) {
            return { error: "No se puede mover más abajo" };
        }

        // Swap orders
        await db
            .update(ticketCategories)
            .set({ displayOrder: nextCategory.displayOrder })
            .where(eq(ticketCategories.id, id));

        await db
            .update(ticketCategories)
            .set({ displayOrder: currentOrder })
            .where(eq(ticketCategories.id, nextCategory.id));

        revalidatePath("/dashboard/admin/configuracion");
        return { success: true };
    } catch (error) {
        console.error("Error moving category:", error);
        return { error: "Error al mover categoría" };
    }
}

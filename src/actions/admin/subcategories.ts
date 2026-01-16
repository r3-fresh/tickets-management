"use server";

import { db } from "@/db";
import { ticketSubcategories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq, sql, gt, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSubcategory(
    categoryId: number,
    name: string,
    description: string,
    isActive: boolean
) {
    await requireAdmin();

    try {
        // Get max display order for this category
        const result = await db
            .select({ maxOrder: sql<number>`coalesce(max(${ticketSubcategories.displayOrder}), 0)` })
            .from(ticketSubcategories)
            .where(eq(ticketSubcategories.categoryId, categoryId));

        const newOrder = (result[0]?.maxOrder || 0) + 1;

        await db.insert(ticketSubcategories).values({
            categoryId,
            name,
            description: description || null,
            isActive,
            displayOrder: newOrder,
        });

        revalidatePath("/dashboard/admin/settings");
        revalidatePath("/dashboard/tickets/new");
        return { success: true };
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return { error: "Error al crear subcategoría" };
    }
}

export async function updateSubcategory(
    id: number,
    categoryId: number,
    name: string,
    description: string,
    isActive: boolean
) {
    await requireAdmin();

    try {
        await db
            .update(ticketSubcategories)
            .set({
                categoryId,
                name,
                description: description || null,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/admin/settings");
        revalidatePath("/dashboard/tickets/new");
        return { success: true };
    } catch (error) {
        console.error("Error updating subcategory:", error);
        return { error: "Error al actualizar subcategoría" };
    }
}

export async function deleteSubcategory(id: number) {
    await requireAdmin();

    try {
        await db.delete(ticketSubcategories).where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/admin/settings");
        revalidatePath("/dashboard/tickets/new");
        return { success: true };
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return { error: "Error al eliminar subcategoría" };
    }
}

export async function toggleSubcategoryActive(id: number) {
    await requireAdmin();

    try {
        const subcategory = await db.query.ticketSubcategories.findFirst({
            where: eq(ticketSubcategories.id, id),
        });

        if (!subcategory) {
            return { error: "Subcategoría no encontrada" };
        }

        await db
            .update(ticketSubcategories)
            .set({
                isActive: !subcategory.isActive,
                updatedAt: new Date(),
            })
            .where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/admin/settings");
        revalidatePath("/dashboard/tickets/new");
        return { success: true };
    } catch (error) {
        console.error("Error toggling subcategory:", error);
        return { error: "Error al cambiar estado" };
    }
}

export async function moveSubcategoryUp(id: number, categoryId: number, currentOrder: number) {
    await requireAdmin();

    try {
        const prevSubcategory = await db.query.ticketSubcategories.findFirst({
            where: (subcategories, { and, eq, lt }) =>
                and(
                    eq(subcategories.categoryId, categoryId),
                    lt(subcategories.displayOrder, currentOrder)
                ),
            orderBy: (subcategories, { desc }) => [desc(subcategories.displayOrder)],
        });

        if (!prevSubcategory) {
            return { error: "No se puede mover más arriba" };
        }

        await db
            .update(ticketSubcategories)
            .set({ displayOrder: prevSubcategory.displayOrder })
            .where(eq(ticketSubcategories.id, id));

        await db
            .update(ticketSubcategories)
            .set({ displayOrder: currentOrder })
            .where(eq(ticketSubcategories.id, prevSubcategory.id));

        revalidatePath("/dashboard/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error moving subcategory:", error);
        return { error: "Error al mover subcategoría" };
    }
}

export async function moveSubcategoryDown(id: number, categoryId: number, currentOrder: number) {
    await requireAdmin();

    try {
        const nextSubcategory = await db.query.ticketSubcategories.findFirst({
            where: (subcategories, { and, eq, gt }) =>
                and(
                    eq(subcategories.categoryId, categoryId),
                    gt(subcategories.displayOrder, currentOrder)
                ),
            orderBy: (subcategories, { asc }) => [asc(subcategories.displayOrder)],
        });

        if (!nextSubcategory) {
            return { error: "No se puede mover más abajo" };
        }

        await db
            .update(ticketSubcategories)
            .set({ displayOrder: nextSubcategory.displayOrder })
            .where(eq(ticketSubcategories.id, id));

        await db
            .update(ticketSubcategories)
            .set({ displayOrder: currentOrder })
            .where(eq(ticketSubcategories.id, nextSubcategory.id));

        revalidatePath("/dashboard/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error moving subcategory:", error);
        return { error: "Error al mover subcategoría" };
    }
}

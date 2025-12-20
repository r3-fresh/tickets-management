"use server";

import { db } from "@/db";
import { ticketCategories } from "@/db/schema";
import { requireAdmin } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategories() {
    await requireAdmin();

    try {
        const categories = await db.query.ticketCategories.findMany({
            orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
            with: {
                subcategories: {
                    orderBy: (subcategories, { asc }) => [asc(subcategories.displayOrder)],
                },
            },
        });

        return { success: true, data: categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { error: "Error al obtener categorías" };
    }
}

export async function createCategory(name: string, description?: string) {
    await requireAdmin();

    try {
        // Get max display order
        const categories = await db.select().from(ticketCategories);
        const maxOrder = Math.max(...categories.map(c => c.displayOrder), 0);

        const [newCategory] = await db.insert(ticketCategories).values({
            name,
            description,
            displayOrder: maxOrder + 1,
        }).returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: newCategory };
    } catch (error) {
        console.error("Error creating category:", error);
        return { error: "Error al crear categoría" };
    }
}

export async function updateCategory(id: number, data: { name?: string; description?: string }) {
    await requireAdmin();

    try {
        const [updated] = await db.update(ticketCategories)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(ticketCategories.id, id))
            .returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating category:", error);
        return { error: "Error al actualizar categoría" };
    }
}

export async function toggleCategoryActive(id: number, isActive: boolean) {
    await requireAdmin();

    try {
        await db.update(ticketCategories)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(ticketCategories.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error toggling category:", error);
        return { error: "Error al cambiar estado de categoría" };
    }
}

export async function deleteCategory(id: number) {
    await requireAdmin();

    try {
        // Subcategories will cascade delete due to FK constraint
        await db.delete(ticketCategories).where(eq(ticketCategories.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { error: "Error al eliminar categoría" };
    }
}

export async function reorderCategories(orderedIds: number[]) {
    await requireAdmin();

    try {
        // Update display order for each category
        for (let i = 0; i < orderedIds.length; i++) {
            await db.update(ticketCategories)
                .set({ displayOrder: i, updatedAt: new Date() })
                .where(eq(ticketCategories.id, orderedIds[i]));
        }

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error reordering categories:", error);
        return { error: "Error al reordenar categorías" };
    }
}

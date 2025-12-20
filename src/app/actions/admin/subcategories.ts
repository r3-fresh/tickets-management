"use server";

import { db } from "@/db";
import { ticketSubcategories } from "@/db/schema";
import { requireAdmin } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSubcategories(categoryId?: number) {
    await requireAdmin();

    try {
        if (categoryId) {
            const subcategories = await db.query.ticketSubcategories.findMany({
                where: (subcategories, { eq }) => eq(subcategories.categoryId, categoryId),
                orderBy: (subcategories, { asc }) => [asc(subcategories.displayOrder)],
            });
            return { success: true, data: subcategories };
        } else {
            const subcategories = await db.query.ticketSubcategories.findMany({
                orderBy: (subcategories, { asc }) => [asc(subcategories.displayOrder)],
                with: {
                    category: true,
                },
            });
            return { success: true, data: subcategories };
        }
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return { error: "Error al obtener subcategorías" };
    }
}

export async function createSubcategory(categoryId: number, name: string, description?: string) {
    await requireAdmin();

    try {
        // Get max display order for this category
        const subcategories = await db.select()
            .from(ticketSubcategories)
            .where(eq(ticketSubcategories.categoryId, categoryId));
        const maxOrder = Math.max(...subcategories.map(s => s.displayOrder), 0);

        const [newSubcategory] = await db.insert(ticketSubcategories).values({
            categoryId,
            name,
            description,
            displayOrder: maxOrder + 1,
        }).returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: newSubcategory };
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return { error: "Error al crear subcategoría" };
    }
}

export async function updateSubcategory(id: number, data: { name?: string; description?: string }) {
    await requireAdmin();

    try {
        const [updated] = await db.update(ticketSubcategories)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(ticketSubcategories.id, id))
            .returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating subcategory:", error);
        return { error: "Error al actualizar subcategoría" };
    }
}

export async function toggleSubcategoryActive(id: number, isActive: boolean) {
    await requireAdmin();

    try {
        await db.update(ticketSubcategories)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error toggling subcategory:", error);
        return { error: "Error al cambiar estado de subcategoría" };
    }
}

export async function deleteSubcategory(id: number) {
    await requireAdmin();

    try {
        await db.delete(ticketSubcategories).where(eq(ticketSubcategories.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return { error: "Error al eliminar subcategoría" };
    }
}

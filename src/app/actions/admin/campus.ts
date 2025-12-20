"use server";

import { db } from "@/db";
import { campusLocations } from "@/db/schema";
import { requireAdmin } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCampuses() {
    await requireAdmin();

    try {
        const campuses = await db.query.campusLocations.findMany({
            orderBy: (campus, { asc }) => [asc(campus.displayOrder)],
        });

        return { success: true, data: campuses };
    } catch (error) {
        console.error("Error fetching campuses:", error);
        return { error: "Error al obtener campus" };
    }
}

export async function createCampus(name: string, code?: string) {
    await requireAdmin();

    try {
        const campuses = await db.select().from(campusLocations);
        const maxOrder = Math.max(...campuses.map(c => c.displayOrder), 0);

        const [newCampus] = await db.insert(campusLocations).values({
            name,
            code,
            displayOrder: maxOrder + 1,
        }).returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: newCampus };
    } catch (error) {
        console.error("Error creating campus:", error);
        return { error: "Error al crear campus" };
    }
}

export async function updateCampus(id: number, data: { name?: string; code?: string }) {
    await requireAdmin();

    try {
        const [updated] = await db.update(campusLocations)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(campusLocations.id, id))
            .returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating campus:", error);
        return { error: "Error al actualizar campus" };
    }
}

export async function toggleCampusActive(id: number, isActive: boolean) {
    await requireAdmin();

    try {
        await db.update(campusLocations)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(campusLocations.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error toggling campus:", error);
        return { error: "Error al cambiar estado de campus" };
    }
}

export async function deleteCampus(id: number) {
    await requireAdmin();

    try {
        await db.delete(campusLocations).where(eq(campusLocations.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error deleting campus:", error);
        return { error: "Error al eliminar campus" };
    }
}

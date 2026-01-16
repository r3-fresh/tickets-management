"use server";

import { db } from "@/db";
import { workAreas } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getWorkAreas() {
    await requireAdmin();

    try {
        const areas = await db.query.workAreas.findMany({
            orderBy: (areas, { asc }) => [asc(areas.displayOrder)],
        });

        return { success: true, data: areas };
    } catch (error) {
        console.error("Error fetching work areas:", error);
        return { error: "Error al obtener áreas de trabajo" };
    }
}

export async function createWorkArea(name: string, description?: string) {
    await requireAdmin();

    try {
        const areas = await db.select().from(workAreas);
        const maxOrder = Math.max(...areas.map(a => a.displayOrder), 0);

        const [newArea] = await db.insert(workAreas).values({
            name,
            description,
            displayOrder: maxOrder + 1,
        }).returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: newArea };
    } catch (error) {
        console.error("Error creating work area:", error);
        return { error: "Error al crear área de trabajo" };
    }
}

export async function updateWorkArea(id: number, data: { name?: string; description?: string }) {
    await requireAdmin();

    try {
        const [updated] = await db.update(workAreas)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(workAreas.id, id))
            .returning();

        revalidatePath("/dashboard/admin/config");
        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating work area:", error);
        return { error: "Error al actualizar área de trabajo" };
    }
}

export async function toggleWorkAreaActive(id: number, isActive: boolean) {
    await requireAdmin();

    try {
        await db.update(workAreas)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(workAreas.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error toggling work area:", error);
        return { error: "Error al cambiar estado de área" };
    }
}

export async function deleteWorkArea(id: number) {
    await requireAdmin();

    try {
        await db.delete(workAreas).where(eq(workAreas.id, id));

        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error deleting work area:", error);
        return { error: "Error al eliminar área de trabajo" };
    }
}

"use server";

import { db } from "@/db";
import { workAreas } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createWorkArea(name: string, description: string, isActive: boolean) {
    await requireAdmin();

    try {
        await db.insert(workAreas).values({
            name,
            description: description || null,
            isActive,
        });

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error creating work area:", error);
        return { error: "Error al crear área de trabajo" };
    }
}

export async function updateWorkArea(id: number, name: string, description: string, isActive: boolean) {
    await requireAdmin();

    try {
        await db
            .update(workAreas)
            .set({
                name,
                description: description || null,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(workAreas.id, id));

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error updating work area:", error);
        return { error: "Error al actualizar área de trabajo" };
    }
}

export async function deleteWorkArea(id: number) {
    await requireAdmin();

    try {
        await db.delete(workAreas).where(eq(workAreas.id, id));

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error deleting work area:", error);
        return { error: "Error al eliminar área de trabajo" };
    }
}

export async function toggleWorkAreaActive(id: number) {
    await requireAdmin();

    try {
        const [updated] = await db
            .update(workAreas)
            .set({
                isActive: sql`NOT ${workAreas.isActive}`,
                updatedAt: new Date(),
            })
            .where(eq(workAreas.id, id))
            .returning({ id: workAreas.id });

        if (!updated) {
            return { error: "Área de trabajo no encontrada" };
        }

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error toggling work area:", error);
        return { error: "Error al cambiar estado" };
    }
}

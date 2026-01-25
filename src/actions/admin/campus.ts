"use server";

import { db } from "@/db";
import { campusLocations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCampus(name: string, code: string, isActive: boolean) {
    await requireAdmin();

    try {
        await db.insert(campusLocations).values({
            name,
            code,
            isActive,
        });

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error creating campus:", error);
        return { error: "Error al crear campus" };
    }
}

export async function updateCampus(id: number, name: string, code: string, isActive: boolean) {
    await requireAdmin();

    try {
        await db
            .update(campusLocations)
            .set({
                name,
                code,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(campusLocations.id, id));

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error updating campus:", error);
        return { error: "Error al actualizar campus" };
    }
}

export async function deleteCampus(id: number) {
    await requireAdmin();

    try {
        await db.delete(campusLocations).where(eq(campusLocations.id, id));

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error deleting campus:", error);
        return { error: "Error al eliminar campus" };
    }
}

export async function toggleCampusActive(id: number) {
    await requireAdmin();

    try {
        const campusItem = await db.query.campusLocations.findFirst({
            where: eq(campusLocations.id, id),
        });

        if (!campusItem) {
            return { error: "Campus no encontrado" };
        }

        await db
            .update(campusLocations)
            .set({
                isActive: !campusItem.isActive,
                updatedAt: new Date(),
            })
            .where(eq(campusLocations.id, id));

        revalidatePath("/dashboard/admin/configuracion");
        revalidatePath("/dashboard/tickets/nuevo");
        return { success: true };
    } catch (error) {
        console.error("Error toggling campus:", error);
        return { error: "Error al cambiar estado" };
    }
}

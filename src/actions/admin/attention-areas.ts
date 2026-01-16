"use server";

import { db } from "@/db";
import { attentionAreas } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const attentionAreaSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    slug: z.string().min(3, "El slug debe tener al menos 3 caracteres"),
    isAcceptingTickets: z.boolean().default(true),
});

export async function createAttentionArea(formData: FormData) {
    await requireAdmin();

    const rawData = {
        name: formData.get("name"),
        slug: formData.get("slug"),
        isAcceptingTickets: formData.get("isAcceptingTickets") === "true",
    };

    const result = attentionAreaSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos" };
    }

    try {
        await db.insert(attentionAreas).values(result.data);
        revalidatePath("/dashboard/admin/areas");
        return { success: true };
    } catch (error) {
        console.error("Error creating attention area:", error);
        return { error: "Error al crear el área" };
    }
}

export async function updateAttentionArea(id: number, formData: FormData) {
    await requireAdmin();

    const rawData = {
        name: formData.get("name"),
        slug: formData.get("slug"),
        isAcceptingTickets: formData.get("isAcceptingTickets") === "true",
    };

    const result = attentionAreaSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos" };
    }

    try {
        await db.update(attentionAreas)
            .set({
                ...result.data,
                updatedAt: new Date(),
            })
            .where(eq(attentionAreas.id, id));

        revalidatePath("/dashboard/admin/areas");
        return { success: true };
    } catch (error) {
        console.error("Error updating attention area:", error);
        return { error: "Error al actualizar el área" };
    }
}

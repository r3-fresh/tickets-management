"use server";

import { db } from "@/db";
import { attentionAreas } from "@/db/schema";
import { requireAgent } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateAreaConfigSchema = z.object({
    isAcceptingTickets: z.boolean(),
    closedMessage: z.string().optional(),
    closedUntil: z.string().optional().nullable(), // Receive as string from form
});

export async function updateAreaConfigAction(formData: FormData) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes un área asignada." };
    }

    const rawData = {
        isAcceptingTickets: formData.get("isAcceptingTickets") === "true",
        closedMessage: formData.get("closedMessage"),
        closedUntil: formData.get("closedUntil"),
    };

    const result = updateAreaConfigSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos" };
    }

    const { isAcceptingTickets, closedMessage, closedUntil } = result.data;

    try {
        await db.update(attentionAreas)
            .set({
                isAcceptingTickets,
                closedMessage: closedMessage || null,
                closedUntil: closedUntil ? new Date(closedUntil) : null,
                updatedAt: new Date(),
            })
            .where(eq(attentionAreas.id, session.user.attentionAreaId));

        revalidatePath("/dashboard/agent/settings");
        revalidatePath("/dashboard/tickets/new"); // Revalidate ticket form

        return { success: true };
    } catch (error) {
        console.error("Error updating area config:", error);
        return { error: "Error al actualizar la configuración" };
    }
}

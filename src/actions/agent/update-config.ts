"use server";

import { db } from "@/db";
import { attentionAreas } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateAreaConfigAction(formData: FormData) {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return { error: "No tienes área asignada" };
    }

    try {
        const isAcceptingTickets = formData.get("isAcceptingTickets") === "true";

        await db
            .update(attentionAreas)
            .set({
                isAcceptingTickets,
                updatedAt: new Date(),
            })
            .where(eq(attentionAreas.id, session.user.attentionAreaId));

        revalidatePath("/dashboard/agent/settings");
        revalidatePath("/dashboard/tickets/new");

        return { success: true };
    } catch (error) {
        console.error("Error updating area config:", error);
        return { error: "No se pudo actualizar la configuración" };
    }
}

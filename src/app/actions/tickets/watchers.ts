"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { requireAuth } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateWatchersAction(ticketId: number, watchers: string[]) {
    await requireAuth();

    try {
        await db.update(tickets)
            .set({ watchers: watchers })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating watchers:", error);
        return { error: "Error al actualizar observadores" };
    }
}

"use server";

import { db } from "@/db";
import { ticketViews } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";

export async function markTicketAsViewed(ticketId: number) {
    const session = await requireAuth();

    try {
        await db
            .insert(ticketViews)
            .values({
                ticketId,
                userId: session.user.id,
                lastViewedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [ticketViews.userId, ticketViews.ticketId],
                set: { lastViewedAt: new Date() },
            });

        return { success: true };
    } catch (error) {
        console.error("Error marking ticket as viewed:", error);
        return { error: "Error al marcar como visto" };
    }
}

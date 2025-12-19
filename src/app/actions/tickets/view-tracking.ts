"use server";

import { db } from "@/db";
import { ticketViews } from "@/db/schema";
import { requireAuth } from "@/lib/utils/server-auth";
import { eq, and } from "drizzle-orm";

export async function markTicketAsViewed(ticketId: number) {
    const session = await requireAuth();

    try {
        // Check if view record exists
        const existingView = await db.query.ticketViews.findFirst({
            where: and(
                eq(ticketViews.ticketId, ticketId),
                eq(ticketViews.userId, session.user.id)
            ),
        });

        if (existingView) {
            // Update existing view
            await db.update(ticketViews)
                .set({ lastViewedAt: new Date() })
                .where(and(
                    eq(ticketViews.ticketId, ticketId),
                    eq(ticketViews.userId, session.user.id)
                ));
        } else {
            // Create new view record
            await db.insert(ticketViews).values({
                ticketId,
                userId: session.user.id,
                lastViewedAt: new Date(),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error marking ticket as viewed:", error);
        return { error: "Error al marcar como visto" };
    }
}

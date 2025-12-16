"use server";

import { db } from "@/db";
import { ticketViews } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function markTicketAsViewed(ticketId: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { error: "No autorizado" };
    }

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

"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { requireAuth } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TICKET_STATUS } from "@/lib/constants/tickets";

export async function userCancelTicketAction(ticketId: number) {
    const session = await requireAuth();

    try {
        // Enforce user is creator
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
        });

        if (!ticket) return { error: "Ticket no encontrado" };

        if (ticket.createdById !== session.user.id) {
            return { error: "Solo el creador puede anular este ticket" };
        }

        if (ticket.status === TICKET_STATUS.RESOLVED || ticket.status === TICKET_STATUS.VOIDED) {
            return { error: "El ticket ya está cerrado" };
        }

        await db.update(tickets)
            .set({
                status: TICKET_STATUS.VOIDED,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error canceling ticket:", error);
        return { error: "Error al anular el ticket" };
    }
}

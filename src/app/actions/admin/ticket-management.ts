"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { requireAdmin } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TICKET_STATUS } from "@/lib/constants/tickets";
import type { TicketStatus } from "@/types";

export async function assignTicketToSelf(ticketId: number) {
    const session = await requireAdmin();

    try {
        await db.update(tickets)
            .set({
                assignedToId: session.user.id,
                status: TICKET_STATUS.IN_PROGRESS,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/admin/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error assigning ticket:", error);
        return { error: "Error al asignar el ticket" };
    }
}

export async function unassignTicket(ticketId: number) {
    await requireAdmin();

    try {
        await db.update(tickets)
            .set({
                assignedToId: null,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/admin/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error unassigning ticket:", error);
        return { error: "Error al desasignar el ticket" };
    }
}

export async function updateTicketStatus(ticketId: number, newStatus: TicketStatus) {
    await requireAdmin();

    try {
        await db.update(tickets)
            .set({
                status: newStatus,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/admin/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket status:", error);
        return { error: "Error al actualizar el estado" };
    }
}

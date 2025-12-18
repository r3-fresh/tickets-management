"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function assignTicketToSelf(ticketId: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        return { error: "No autorizado" };
    }

    try {
        await db.update(tickets)
            .set({
                assignedToId: session.user.id,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/agent");
        return { success: true };
    } catch (error) {
        console.error("Error assigning ticket:", error);
        return { error: "Error al asignar el ticket" };
    }
}

export async function updateTicketStatus(ticketId: number, newStatus: "open" | "in_progress" | "resolved" | "voided") {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        return { error: "No autorizado" };
    }

    try {
        await db.update(tickets)
            .set({
                status: newStatus,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/agent");
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket status:", error);
        return { error: "Error al actualizar el estado" };
    }
}

export async function unassignTicket(ticketId: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        return { error: "No autorizado" };
    }

    try {
        await db.update(tickets)
            .set({
                assignedToId: null,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/agent");
        return { success: true };
    } catch (error) {
        console.error("Error unassigning ticket:", error);
        return { error: "Error al desasignar el ticket" };
    }
}

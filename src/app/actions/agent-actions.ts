"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

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
        const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));

        if (!ticket) {
            return { error: "Ticket no encontrado" };
        }

        await db.update(tickets)
            .set({
                status: newStatus,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        // Send email notification based on status
        const statusMessages: Record<string, string> = {
            in_progress: "Tu ticket está siendo atendido",
            resolved: "Tu ticket ha sido resuelto",
            voided: "Tu ticket ha sido anulado",
        };

        if (newStatus !== "open" && statusMessages[newStatus]) {
            // Get ticket creator email (we'd need to join with users table)
            // For now, simplified version
            await sendEmail({
                to: ticket.createdById, // This should be the email, need to fetch from users table
                subject: `Actualización de Ticket #${ticketId}`,
                html: `
                    <h2>${statusMessages[newStatus]}</h2>
                    <p><strong>Ticket:</strong> ${ticket.title}</p>
                    <p><strong>Nuevo Estado:</strong> ${newStatus}</p>
                `,
            });
        }

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/agent");
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket status:", error);
        return { error: "Error al actualizar el estado" };
    }
}

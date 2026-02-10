"use server";

import { db } from "@/db";
import { tickets, users } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { TICKET_STATUS } from "@/lib/constants/tickets";
import { sendTicketAssignedEmail } from "@/lib/email/send-emails";
import type { TicketStatus } from "@/types";

export async function assignTicketToSelf(ticketId: number) {
    const session = await requireAgent();

    try {
        await db.update(tickets)
            .set({
                assignedToId: session.user.id,
                status: TICKET_STATUS.IN_PROGRESS,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        // Get full ticket details for email
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
            with: {
                category: true,
                subcategory: true,
                attentionArea: true,
                createdBy: true,
            },
        });

        if (ticket && ticket.attentionAreaId) {
            // Defer email notification after response is sent to user
            const ticketData = ticket;
            const agentName = session.user.name;
            after(async () => {
                try {
                    // Get agents and watchers in parallel
                    const [agentData, watcherData] = await Promise.all([
                        db.select({ email: users.email })
                            .from(users)
                            .where(and(
                                eq(users.role, 'agent'),
                                eq(users.attentionAreaId, ticketData.attentionAreaId!)
                            )),
                        ticketData.watchers && ticketData.watchers.length > 0
                            ? db.select({ email: users.email })
                                .from(users)
                                .where(inArray(users.id, ticketData.watchers))
                            : Promise.resolve([] as { email: string }[]),
                    ]);

                    const watcherEmails = watcherData.map(w => w.email);

                    await sendTicketAssignedEmail({
                        ticketCode: ticketData.ticketCode,
                        title: ticketData.title,
                        categoryName: ticketData.category?.name || 'Sin categoría',
                        subcategoryName: ticketData.subcategory?.name || 'Sin subcategoría',
                        ticketId: ticketData.id,
                        agentName,
                        creatorEmail: ticketData.createdBy.email,
                        creatorName: ticketData.createdBy.name,
                        agentEmails: agentData.map(a => a.email),
                        watcherEmails: watcherEmails,
                        attentionAreaName: ticketData.attentionArea?.name || 'Hub de Información',
                        emailThreadId: ticketData.emailThreadId,
                        initialMessageId: ticketData.initialMessageId,
                    });
                } catch (emailError) {
                    console.error("Error sending assigned email:", emailError);
                }
            });
        }

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/admin/tickets");
        revalidatePath("/dashboard/agente");
        return { success: true };
    } catch (error) {
        console.error("Error assigning ticket:", error);
        return { error: "Error al asignar el ticket" };
    }
}

export async function unassignTicket(ticketId: number) {
    const session = await requireAgent();

    try {
        await db.update(tickets)
            .set({
                assignedToId: null,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/admin/tickets");
        revalidatePath("/dashboard/agente");
        return { success: true };
    } catch (error) {
        console.error("Error unassigning ticket:", error);
        return { error: "Error al desasignar el ticket" };
    }
}

export async function updateTicketStatus(ticketId: number, newStatus: TicketStatus) {
    const session = await requireAgent();

    try {
        await db.update(tickets)
            .set({
                status: newStatus,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/admin/tickets");
        revalidatePath("/dashboard/agente");
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket status:", error);
        return { error: "Error al actualizar el estado" };
    }
}

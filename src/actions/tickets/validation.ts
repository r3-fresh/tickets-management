"use server";

import { db } from "@/db";
import { tickets, users, attentionAreas } from "@/db/schema";
import { requireAuth, requireAgent } from "@/lib/auth/helpers";
import { eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TICKET_STATUS, CLOSURE_TYPE } from "@/lib/constants/tickets";
import { sendValidationRequestEmail, sendTicketResolvedEmail, sendTicketRejectedEmail } from "@/lib/email/send-emails";

/**
 * User approves ticket closure - moves from pending_validation to resolved
 */
export async function approveTicketValidation(ticketId: number) {
    const session = await requireAuth();

    try {
        // Verify ticket exists and user is the creator
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
            with: {
                category: true,
                subcategory: true,
                attentionArea: true,
                createdBy: true,
            },
        });

        if (!ticket) {
            return { error: "Ticket no encontrado" };
        }

        if (ticket.createdById !== session.user.id) {
            return { error: "Solo el creador del ticket puede validar" };
        }

        if (ticket.status !== TICKET_STATUS.PENDING_VALIDATION) {
            return { error: "El ticket no está pendiente de validación" };
        }

        // Approve and close ticket
        await db.update(tickets)
            .set({
                status: TICKET_STATUS.RESOLVED,
                closedBy: CLOSURE_TYPE.USER,
                closedAt: new Date(),
                closedByUserId: session.user.id,
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        // Send Email: Ticket Resolved
        if (ticket.attentionAreaId) {
            try {
                // Get agents
                const agentData = await db.select({ email: users.email })
                    .from(users)
                    .where(and(
                        eq(users.role, 'agent'),
                        eq(users.attentionAreaId, ticket.attentionAreaId)
                    ));

                // Get watchers
                let watcherEmails: string[] = [];
                if (ticket.watchers && ticket.watchers.length > 0) {
                    const watcherData = await db.select({ email: users.email })
                        .from(users)
                        .where(inArray(users.id, ticket.watchers));
                    watcherEmails = watcherData.map(w => w.email);
                }

                await sendTicketResolvedEmail({
                    ticketCode: ticket.ticketCode,
                    title: ticket.title,
                    categoryName: ticket.category?.name || 'Sin categoría',
                    subcategoryName: ticket.subcategory?.name || 'Sin subcategoría',
                    ticketId: ticket.id,
                    // Unified Context
                    creatorEmail: ticket.createdBy.email,
                    creatorName: ticket.createdBy.name,
                    agentEmails: agentData.map(a => a.email),
                    watcherEmails: watcherEmails,
                    attentionAreaName: ticket.attentionArea?.name || 'Hub de Información',
                    emailThreadId: ticket.emailThreadId,
                    initialMessageId: ticket.initialMessageId,
                });
            } catch (emailError) {
                console.error("Error sending resolved email:", emailError);
            }
        }

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error approving validation:", error);
        return { error: "Error al aprobar la validación" };
    }
}

/**
 * User rejects ticket closure - moves from pending_validation back to in_progress
 */
export async function rejectTicketValidation(ticketId: number) {
    const session = await requireAuth();

    try {
        // Verify ticket exists and user is the creator
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
            with: {
                category: true,
                subcategory: true,
                attentionArea: true,
                createdBy: true,
            },
        });

        if (!ticket) {
            return { error: "Ticket no encontrado" };
        }

        if (ticket.createdById !== session.user.id) {
            return { error: "Solo el creador del ticket puede rechazar" };
        }

        if (ticket.status !== TICKET_STATUS.PENDING_VALIDATION) {
            return { error: "El ticket no está pendiente de validación" };
        }

        // Reject and move back to in_progress
        await db.update(tickets)
            .set({
                status: TICKET_STATUS.IN_PROGRESS,
                validationRequestedAt: null, // Clear validation request
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        // Send Email: Ticket Rejected
        if (ticket.attentionAreaId) {
            try {
                // Get agents
                const agentData = await db.select({ email: users.email })
                    .from(users)
                    .where(and(
                        eq(users.role, 'agent'),
                        eq(users.attentionAreaId, ticket.attentionAreaId)
                    ));

                // Get watchers
                let watcherEmails: string[] = [];
                if (ticket.watchers && ticket.watchers.length > 0) {
                    const watcherData = await db.select({ email: users.email })
                        .from(users)
                        .where(inArray(users.id, ticket.watchers));
                    watcherEmails = watcherData.map(w => w.email);
                }

                await sendTicketRejectedEmail({
                    ticketCode: ticket.ticketCode,
                    title: ticket.title,
                    categoryName: ticket.category?.name || 'Sin categoría',
                    subcategoryName: ticket.subcategory?.name || 'Sin subcategoría',
                    ticketId: ticket.id,
                    // Unified Context
                    creatorEmail: ticket.createdBy.email,
                    creatorName: ticket.createdBy.name,
                    agentEmails: agentData.map(a => a.email),
                    watcherEmails: watcherEmails,
                    attentionAreaName: ticket.attentionArea?.name || 'Hub de Información',
                    emailThreadId: ticket.emailThreadId,
                    initialMessageId: ticket.initialMessageId,
                });
            } catch (emailError) {
                console.error("Error sending rejected email:", emailError);
            }
        }

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting validation:", error);
        return { error: "Error al rechazar la validación" };
    }
}

/**
 * Admin/Agent requests validation from user - moves from in_progress to pending_validation
 */
export async function requestValidation(ticketId: number) {
    const session = await requireAgent();

    // Only admins/agents can request validation (handled by requireAgent)

    try {
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
            with: {
                createdBy: true,
            }
        });

        if (!ticket || !ticket.createdBy) {
            return { error: "Ticket no encontrado" };
        }

        if (ticket.status !== TICKET_STATUS.IN_PROGRESS) {
            return { error: "Solo se puede solicitar validación desde estado 'En Progreso'" };
        }

        if (!ticket.assignedToId) {
            return { error: "El ticket debe estar asignado para solicitar validación" };
        }

        await db.update(tickets)
            .set({
                status: TICKET_STATUS.PENDING_VALIDATION,
                validationRequestedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        // Send email notification
        try {
            // Get ticket details again (with relations)
            const ticketWithDetails = await db.query.tickets.findFirst({
                where: eq(tickets.id, ticketId),
                with: {
                    category: true,
                    subcategory: true,
                    attentionArea: true,
                    createdBy: true,
                },
            });

            if (ticketWithDetails?.attentionAreaId) {
                // Get agents
                const agentData = await db.select({ email: users.email })
                    .from(users)
                    .where(and(
                        eq(users.role, 'agent'),
                        eq(users.attentionAreaId, ticketWithDetails.attentionAreaId)
                    ));

                // Get watchers
                let watcherEmails: string[] = [];
                if (ticketWithDetails.watchers && ticketWithDetails.watchers.length > 0) {
                    const watcherData = await db.select({ email: users.email })
                        .from(users)
                        .where(inArray(users.id, ticketWithDetails.watchers));
                    watcherEmails = watcherData.map(w => w.email);
                }

                await sendValidationRequestEmail({
                    ticketCode: ticket.ticketCode,
                    title: ticket.title,
                    categoryName: ticketWithDetails?.category?.name || 'Sin categoría',
                    subcategoryName: ticketWithDetails?.subcategory?.name || 'Sin subcategoría',
                    ticketId: ticket.id,
                    creatorEmail: ticket.createdBy.email,
                    creatorName: ticket.createdBy.name,
                    // Unified Context
                    agentEmails: agentData.map(a => a.email),
                    watcherEmails: watcherEmails,
                    attentionAreaName: ticketWithDetails?.attentionArea?.name || 'Hub de Información',
                    emailThreadId: ticket.emailThreadId,
                    initialMessageId: ticket.initialMessageId,
                });
            }
        } catch (emailError) {
            // Log error but don't fail the validation request
            console.error("Error sending email:", emailError);
        }

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/admin/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error requesting validation:", error);
        return { error: "Error al solicitar validación" };
    }
}

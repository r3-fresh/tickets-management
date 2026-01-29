"use server";

import { db } from "@/db";
import { comments, tickets, users, ticketCategories, ticketSubcategories } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { revalidatePath } from "next/cache";
import { eq, and, inArray } from "drizzle-orm";
import { TICKET_STATUS } from "@/lib/constants/tickets";
import { sendUserCommentEmail } from "@/lib/email/send-emails";
import { createRateLimiter } from "@/lib/utils/rate-limit";

// Rate limiter para comentarios: 10 por minuto
const commentRateLimiter = createRateLimiter('MODERATE');

export async function addCommentAction(formData: FormData) {
    const session = await requireAuth();

    // Aplicar rate limiting
    const rateLimitResult = commentRateLimiter(`comment-${session.user.id}`);
    if (!rateLimitResult.success) {
        return { error: "Estás enviando comentarios muy rápido. Por favor, espera un momento." };
    }

    const ticketId = Number(formData.get("ticketId"));
    const content = formData.get("content") as string;

    if (!ticketId || !content || content.trim().length === 0) {
        return { error: "Comentario inválido" };
    }

    try {
        // Get full ticket details including creator
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
            with: {
                category: true,
                subcategory: true,
                attentionArea: true,
                createdBy: true,
            },
        });

        if (!ticket) return { error: "Ticket no encontrado" };

        if (ticket.status === TICKET_STATUS.RESOLVED || ticket.status === TICKET_STATUS.VOIDED) {
            return { error: "No se puede comentar en un ticket cerrado" };
        }

        await db.insert(comments).values({
            ticketId,
            userId: session.user.id,
            content,
            isInternal: false,
        });

        // Send email notification (Unified logic handles recipients: Creator + Agents + Watchers)
        // We trigger this for ANY comment (User or Agent), usually strict logic is applied but
        // user requested threads for everyone.
        if (ticket.attentionAreaId) {
            try {
                // Get agents for this attention area
                const agentData = await db.select({ email: users.email })
                    .from(users)
                    .where(and(
                        eq(users.role, 'agent'),
                        eq(users.attentionAreaId, ticket.attentionAreaId)
                    ));

                // Get watcher emails
                let watcherEmails: string[] = [];
                if (ticket.watchers && ticket.watchers.length > 0) {
                    const watcherData = await db.select({ email: users.email })
                        .from(users)
                        .where(inArray(users.id, ticket.watchers));
                    watcherEmails = watcherData.map(w => w.email);
                }

                await sendUserCommentEmail({
                    ticketCode: ticket.ticketCode,
                    title: ticket.title,
                    status: ticket.status,
                    priority: ticket.priority,
                    categoryName: ticket.category?.name || 'Sin categoría',
                    subcategoryName: ticket.subcategory?.name || 'Sin subcategoría',
                    ticketId: ticket.id,
                    comment: content,
                    userEmail: session.user.email,
                    userName: session.user.name,
                    // Unified Context Params
                    creatorEmail: ticket.createdBy.email,
                    creatorName: ticket.createdBy.name,
                    agentEmails: agentData.map(a => a.email),
                    watcherEmails: watcherEmails,
                    attentionAreaName: ticket.attentionArea?.name || 'Hub de Información',
                    emailThreadId: ticket.emailThreadId,
                    initialMessageId: ticket.initialMessageId,
                });
            } catch (emailError) {
                // Log error but don't fail comment creation
                console.error("Error sending comment notification email:", emailError);
            }
        }

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error("Error adding comment:", error);
        return { error: "Error al guardar el comentario" };
    }
}

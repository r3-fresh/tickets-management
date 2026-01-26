"use server";

import { db } from "@/db";
import { tickets, users, attentionAreas, ticketCategories, ticketSubcategories } from "@/db/schema";
import { createTicketSchema } from "@/lib/validation/schemas";
import { requireAuth } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { TICKET_STATUS } from "@/lib/constants/tickets";
import { sendTicketCreatedEmail } from "@/lib/email/send-emails";
import { eq, inArray, and } from "drizzle-orm";

export async function createTicketAction(formData: FormData) {
    const session = await requireAuth();

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority"),
        categoryId: formData.get("categoryId"),
        subcategoryId: formData.get("subcategoryId"),
        campusId: formData.get("campusId"),
        areaId: formData.get("areaId"),
        attentionAreaId: formData.get("attentionAreaId"),
    };

    const result = createTicketSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos", details: result.error.flatten() };
    }

    const { title, description, priority, categoryId, subcategoryId, campusId, areaId, attentionAreaId } = result.data;

    // Validate if Attention Area is accepting tickets
    const targetArea = await db.query.attentionAreas.findFirst({
        where: eq(attentionAreas.id, attentionAreaId),
    });

    if (!targetArea) {
        return { error: "Área de atención inválida" };
    }

    if (!targetArea.isAcceptingTickets) {
        return {
            error: "Esta área no está aceptando tickets en este momento.",
        };
    }

    // Parse watchers (user IDs)
    let watcherList: string[] = [];
    const watchersData = formData.get("watchers");
    if (watchersData) {
        try {
            watcherList = JSON.parse(watchersData as string);
        } catch (e) {
            console.error("Error parsing watchers:", e);
        }
    }

    try {
        // Generate ticket code with year (YYYY-####)
        const { generateNextTicketCode } = await import("@/lib/utils/ticket-code");
        const ticketCode = await generateNextTicketCode();

        const [newTicket] = await db.insert(tickets).values({
            ticketCode,
            title,
            description,
            priority,
            status: TICKET_STATUS.OPEN,
            createdById: session.user.id,
            categoryId,
            subcategoryId,
            campusId: campusId || null,
            areaId: areaId || null,
            attentionAreaId,
            watchers: watcherList,
        }).returning({ id: tickets.id });

        // Send email notification
        // TO: Creator
        // CC: Agents of category + Watchers
        try {
            // Get category and subcategory names
            const category = await db.query.ticketCategories.findFirst({
                where: eq(ticketCategories.id, categoryId),
            });

            const subcategory = await db.query.ticketSubcategories.findFirst({
                where: eq(ticketSubcategories.id, subcategoryId),
            });

            // Get watcher emails
            let watcherEmails: string[] = [];
            if (watcherList.length > 0) {
                const watcherData = await db.select({ email: users.email })
                    .from(users)
                    .where(inArray(users.id, watcherList));
                watcherEmails = watcherData.map(w => w.email);
            }

            // Get Agent emails for this attention area
            const agentData = await db.select({ email: users.email })
                .from(users)
                .where(and(
                    eq(users.role, 'agent'),
                    eq(users.attentionAreaId, attentionAreaId)
                ));

            const emailResult = await sendTicketCreatedEmail({
                ticketCode,
                title,
                description,
                priority,
                categoryName: category?.name || 'Sin categoría',
                subcategoryName: subcategory?.name || 'Sin subcategoría',
                createdAt: new Date(),
                ticketId: newTicket.id,
                creatorEmail: session.user.email,
                creatorName: session.user.name,
                agentEmails: agentData.map(a => a.email),
                watcherEmails,
                attentionAreaName: targetArea.name,
            });

            if (emailResult.success) {
                // Update ticket with threading info
                // 1. Thread ID (Gmail Native)
                // 2. Initial Message ID (RFC Header for recipients) - NEW ROBUST METHOD
                await db.update(tickets)
                    .set({
                        emailThreadId: emailResult.data?.threadId,
                        initialMessageId: emailResult.data?.rfcMessageId // Captured from actual sent email
                    })
                    .where(eq(tickets.id, newTicket.id));
            }
        } catch (emailError) {
            // Log error but don't fail ticket creation
            console.error("Error sending email:", emailError);
        }

    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: "Error interno del servidor al crear el ticket" };
    }

    redirect(`/dashboard/`);
}

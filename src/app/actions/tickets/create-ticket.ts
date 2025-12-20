"use server";

import { db } from "@/db";
import { tickets, users } from "@/db/schema";
import { createTicketSchema } from "@/lib/schemas";
import { requireAuth } from "@/lib/utils/server-auth";
import { redirect } from "next/navigation";
import { TICKET_STATUS } from "@/lib/constants/tickets";
import { sendTicketCreatedEmail } from "@/lib/email-templates";
import { eq, inArray } from "drizzle-orm";

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
    };

    const result = createTicketSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos", details: result.error.flatten() };
    }

    const { title, description, priority, categoryId, subcategoryId, campusId, areaId } = result.data;

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
            watchers: watcherList,
        }).returning({ id: tickets.id });

        // Send email notification
        // TO: cendoc@continental.edu.pe
        // CC: Creator + Watchers + All Admins
        try {
            // Get watcher emails
            let watcherEmails: string[] = [];
            if (watcherList.length > 0) {
                const watcherData = await db.select({ email: users.email })
                    .from(users)
                    .where(inArray(users.id, watcherList));
                watcherEmails = watcherData.map(w => w.email);
            }

            // Get all admin emails
            const adminData = await db.select({ email: users.email })
                .from(users)
                .where(eq(users.role, 'admin'));
            const adminEmails = adminData.map(a => a.email);

            await sendTicketCreatedEmail({
                ticketCode,
                title,
                description,
                priority,
                createdBy: session.user.name,
                createdByEmail: session.user.email,
                ticketId: newTicket.id,
                watcherEmails,
                adminEmails,
            });
        } catch (emailError) {
            // Log error but don't fail ticket creation
            console.error("Error sending email:", emailError);
        }

    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: "Error interno del servidor al crear el ticket" };
    }

    redirect("/dashboard/tickets");
}

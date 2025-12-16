
"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { createTicketSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth"; // We need server-side auth
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";

export async function createTicketAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { error: "No autorizado" };
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority"),
        categoryId: formData.get("categoryId"),
        subcategory: formData.get("subcategory"),
        ccEmails: formData.get("ccEmails"),
    };

    const result = createTicketSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos", details: result.error.flatten() };
    }

    const { title, description, priority, categoryId, subcategory, ccEmails } = result.data;

    // Parse CC emails
    const ccList = ccEmails
        ? ccEmails.split(",").map(e => e.trim()).filter(e => e.length > 0)
        : [];

    try {
        const [newTicket] = await db.insert(tickets).values({
            title,
            description,
            priority,
            categoryId,
            subcategory,
            createdById: session.user.id,
            ccEmails: ccList,
            status: 'open',
        }).returning();

        // Send Email Notification
        await sendEmail({
            to: session.user.email,
            cc: ccList,
            subject: `Ticket Creade #${newTicket.id}: ${title}`,
            html: `
                <h1>Hola ${session.user.name},</h1>
                <p>Tu ticket ha sido registrado exitosamente.</p>
                <p><strong>Título:</strong> ${title}</p>
                <p><strong>Prioridad:</strong> ${priority}</p>
                <p><strong>Categoría:</strong> ${subcategory}</p>
                <hr />
                <p>Un agente revisará tu caso pronto.</p>
            `,
        });

    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: "Error interno del servidor al crear el ticket" };
    }

    redirect("/dashboard/tickets");
}

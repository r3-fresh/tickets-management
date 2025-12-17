
"use server";

import { db } from "@/db";
import { comments, tickets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addCommentAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { error: "No autorizado" };
    }

    const ticketId = Number(formData.get("ticketId"));
    const content = formData.get("content") as string;

    if (!ticketId || !content || content.trim().length === 0) {
        return { error: "Comentario inválido" };
    }

    try {
        // Check ticket status
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
            columns: { status: true }
        });

        if (!ticket) return { error: "Ticket no encontrado" };

        if (ticket.status === "resolved" || ticket.status === "voided") {
            return { error: "No se puede comentar en un ticket cerrado" };
        }

        await db.insert(comments).values({
            ticketId,
            userId: session.user.id,
            content,
            isInternal: false,
        });

        // Trigger email notification logic here (omitted for brevity)

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error("Error adding comment:", error);
        return { error: "Error al guardar el comentario" };
    }
}

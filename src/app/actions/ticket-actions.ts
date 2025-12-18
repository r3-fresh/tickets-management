
"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { createTicketSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
        area: formData.get("area") || "No aplica",
        campus: formData.get("campus") || "No aplica",
    };

    const result = createTicketSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos", details: result.error.flatten() };
    }

    const { title, description, priority, categoryId, subcategory, area, campus } = result.data;

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
        const { generateNextTicketCode } = await import("@/lib/ticket-utils");
        const ticketCode = await generateNextTicketCode();

        await db.insert(tickets).values({
            ticketCode,
            title,
            description,
            priority,
            categoryId,
            subcategory,
            area: area || "No aplica",
            campus: campus || "No aplica",
            createdById: session.user.id,
            watchers: watcherList,
            status: 'open',
        });

    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: "Error interno del servidor al crear el ticket" };
    }

    redirect("/dashboard/tickets");
}

export async function updateWatchersAction(ticketId: number, watchers: string[]) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { error: "No autorizado" };
    }

    // Optional: Check if user is creator or admin to modify watchers? 
    // Usually creator or existing watchers or admin can modify watchlist.
    // For now allow any auth user to add themselves or others if they have access to the ticket
    // Simplest: Allow modifying if you can see the ticket.

    try {
        await db.update(tickets)
            .set({ watchers: watchers })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating watchers:", error);
        return { error: "Error al actualizar observadores" };
    }
}

export async function userCancelTicketAction(ticketId: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { error: "No autorizado" };
    }

    try {
        // Enforce user is creator
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
        });

        if (!ticket) return { error: "Ticket no encontrado" };

        if (ticket.createdById !== session.user.id) {
            return { error: "Solo el creador puede anular este ticket" };
        }

        if (ticket.status === 'resolved' || ticket.status === 'voided') {
            return { error: "El ticket ya está cerrado" };
        }

        await db.update(tickets)
            .set({
                status: 'voided',
                updatedAt: new Date()
            })
            .where(eq(tickets.id, ticketId));

        revalidatePath(`/dashboard/tickets/${ticketId}`);
        revalidatePath("/dashboard/tickets");
        return { success: true };
    } catch (error) {
        console.error("Error canceling ticket:", error);
        return { error: "Error al anular el ticket" };
    }
}

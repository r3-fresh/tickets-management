"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateWatchersAction(ticketId: number, watchers: string[]) {
    const session = await requireAuth();
    const userId = session.user.id;
    const userRole = session.user.role;

    try {
        // Obtener el ticket para verificar permisos
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, ticketId),
            columns: {
                id: true,
                createdById: true,
                assignedToId: true,
                attentionAreaId: true,
                watchers: true,
            },
        });

        if (!ticket) {
            return { error: "Ticket no encontrado" };
        }

        // Verificar permisos: admin, creador, agente asignado, agente del área, o watcher actual
        const isAdmin = userRole === 'admin';
        const isCreator = ticket.createdById === userId;
        const isAssignedAgent = ticket.assignedToId === userId;
        const isAreaAgent = userRole === 'agent' && session.user.attentionAreaId === ticket.attentionAreaId;
        const isWatcher = ticket.watchers?.includes(userId) ?? false;

        if (!isAdmin && !isCreator && !isAssignedAgent && !isAreaAgent && !isWatcher) {
            return { error: "No tienes permisos para modificar los observadores de este ticket" };
        }

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

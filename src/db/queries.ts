import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories } from "@/db/schema";
import { eq, desc, sql, and, SQL } from "drizzle-orm";

/**
 * Resultado de la query de tickets con conteo de comentarios no leídos.
 */
export type TicketWithUnread = Awaited<ReturnType<typeof queryTicketsWithUnread>>[number];

/**
 * Query reutilizable para obtener tickets con conteo de comentarios no leídos.
 * Consolida el patrón duplicado en dashboards, mis-tickets, seguimiento, explorador y area.
 *
 * @param userId - ID del usuario actual (para calcular no leídos)
 * @param where - Condición WHERE de Drizzle (ej: eq(tickets.createdById, userId))
 * @param limit - Límite de resultados (opcional, sin límite por defecto)
 */
export function queryTicketsWithUnread(
    userId: string,
    where?: SQL,
    limit?: number,
) {
    const query = db
        .select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            title: tickets.title,
            status: tickets.status,
            priority: tickets.priority,
            categoryId: tickets.categoryId,
            categoryName: ticketCategories.name,
            subcategoryId: tickets.subcategoryId,
            areaId: tickets.areaId,
            campusId: tickets.campusId,
            createdById: tickets.createdById,
            assignedToId: tickets.assignedToId,
            createdAt: tickets.createdAt,
            updatedAt: tickets.updatedAt,
            unreadCommentCount: sql<number>`
                cast(
                    count(
                        case 
                            when ${comments.createdAt} > coalesce(${ticketViews.lastViewedAt}, ${tickets.createdAt})
                            and ${comments.userId} != ${userId}
                            then 1 
                        end
                    ) as integer
                )
            `,
            commentCount: sql<number>`cast(count(${comments.id}) as integer)`,
        })
        .from(tickets)
        .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id))
        .leftJoin(comments, eq(tickets.id, comments.ticketId))
        .leftJoin(
            ticketViews,
            and(
                eq(tickets.id, ticketViews.ticketId),
                eq(ticketViews.userId, userId),
            ),
        )
        .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt));

    if (where) {
        query.where(where);
    }

    if (limit) {
        query.limit(limit);
    }

    return query;
}

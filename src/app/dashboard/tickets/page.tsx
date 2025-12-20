import { db } from "@/db";
import { tickets, comments, ticketViews, ticketSubcategories } from "@/db/schema";
import { requireAuth } from "@/lib/utils/server-auth";
import { redirect } from "next/navigation";
import { eq, desc, sql, and, gt } from "drizzle-orm";
import { TicketsList } from "./tickets-list";

export default async function TicketsPage() {
    const session = await requireAuth();

    // Fetch tickets with unread comment count
    const userTickets = await db
        .select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            title: tickets.title,
            description: tickets.description,
            status: tickets.status,
            priority: tickets.priority,
            categoryId: tickets.categoryId,
            subcategoryId: tickets.subcategoryId,
            subcategoryName: ticketSubcategories.name,
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
                            and ${comments.userId} != ${session.user.id}
                            then 1 
                        end
                    ) as integer
                )
            `,
            commentCount: sql<number>`cast(count(${comments.id}) as integer)`,
        })
        .from(tickets)
        .leftJoin(ticketSubcategories, eq(tickets.subcategoryId, ticketSubcategories.id))
        .leftJoin(comments, eq(tickets.id, comments.ticketId))
        .leftJoin(
            ticketViews,
            and(
                eq(tickets.id, ticketViews.ticketId),
                eq(ticketViews.userId, session.user.id)
            )
        )
        .where(eq(tickets.createdById, session.user.id))
        .groupBy(tickets.id, ticketSubcategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt));

    // Fetch assigned users separately
    const ticketsWithAssigned = await db.query.tickets.findMany({
        where: eq(tickets.createdById, session.user.id),
        with: {
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    // Merge unread counts with assigned user data
    const mergedTickets = userTickets.map((ticket) => {
        const withAssigned = ticketsWithAssigned.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
            commentCount: ticket.commentCount,
        };
    });

    return <TicketsList tickets={mergedTickets} isAdmin={session.user.role === "admin"} />;
}

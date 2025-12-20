import { db } from "@/db";
import { tickets, comments, ticketViews, ticketSubcategories } from "@/db/schema";
import { requireAuth } from "@/lib/utils/server-auth";
import { redirect } from "next/navigation";
import { desc, sql, and, not, eq } from "drizzle-orm";
import { TicketsList } from "../tickets-list";

export default async function WatchedTicketsPage() {
    const session = await requireAuth();

    // Fetch tickets where user is a watcher BUT NOT the creator
    const watchedTickets = await db
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
        .where(
            and(
                not(eq(tickets.createdById, session.user.id)), // NOT created by me
                sql`${session.user.id} = ANY(${tickets.watchers})` // I am a watcher
            )
        )
        .groupBy(tickets.id, ticketSubcategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt));

    // Fetch assigned users and creators separately
    const ticketsWithRelations = await db.query.tickets.findMany({
        where: and(
            not(eq(tickets.createdById, session.user.id)),
            sql`${session.user.id} = ANY(${tickets.watchers})`
        ),
        with: {
            assignedTo: true,
            createdBy: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    // Merge with relation data
    const mergedTickets = watchedTickets.map((ticket) => {
        const withRelations = ticketsWithRelations.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withRelations?.assignedTo || null,
            createdBy: withRelations?.createdBy || null,
            commentCount: ticket.commentCount,
        };
    });

    return <TicketsList tickets={mergedTickets} isAdmin={session.user.role === "admin"} isWatchedView={true} />;
}

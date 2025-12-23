import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories } from "@/db/schema";
import { requireAdmin } from "@/lib/utils/server-auth";
import { redirect } from "next/navigation";
import { desc, sql, eq, and } from "drizzle-orm";
import { AdminTicketsTable } from "@/components/admin/admin-tickets-table";

export default async function AdminTicketsPage() {
    const session = await requireAdmin();

    // Fetch ALL tickets with unread count for current admin
    const allTicketsWithUnread = await db
        .select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            title: tickets.title,
            description: tickets.description,
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
                            and ${comments.userId} != ${session.user.id}
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
                eq(ticketViews.userId, session.user.id)
            )
        )
        .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt));

    // Fetch relations separately
    const ticketsWithRelations = await db.query.tickets.findMany({
        with: {
            createdBy: true,
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    // Merge
    const mergedTickets = allTicketsWithUnread.map((ticket) => {
        const withRelations = ticketsWithRelations.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            createdBy: withRelations?.createdBy || null,
            assignedTo: withRelations?.assignedTo || null,
        };
    });

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Bandeja de Tickets</h1>
            <AdminTicketsTable tickets={mergedTickets} />
        </div>
    );
}


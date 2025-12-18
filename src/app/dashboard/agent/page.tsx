import { db } from "@/db";
import { tickets, comments, ticketViews } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, sql, eq, and } from "drizzle-orm";
import { AgentTicketsTable } from "./agent-tickets-table";

export default async function AgentDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch ALL tickets with unread count for current agent
    const allTicketsWithUnread = await db
        .select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            title: tickets.title,
            description: tickets.description,
            status: tickets.status,
            priority: tickets.priority,
            categoryId: tickets.categoryId,
            subcategory: tickets.subcategory,
            area: tickets.area,
            campus: tickets.campus,
            createdById: tickets.createdById,
            assignedToId: tickets.assignedToId,
            createdAt: tickets.createdAt,
            updatedAt: tickets.updatedAt,
            unreadCommentCount: sql<number>`
                cast(
                    count(
                        case 
                            when ${comments.createdAt} > coalesce(${ticketViews.lastViewedAt}, ${tickets.createdAt})
                            then 1 
                        end
                    ) as integer
                )
            `,
            commentCount: sql<number>`cast(count(${comments.id}) as integer)`,
        })
        .from(tickets)
        .leftJoin(comments, eq(tickets.id, comments.ticketId))
        .leftJoin(
            ticketViews,
            and(
                eq(tickets.id, ticketViews.ticketId),
                eq(ticketViews.userId, session.user.id)
            )
        )
        .groupBy(tickets.id, ticketViews.lastViewedAt)
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Bandeja de Tickets</h1>
            <AgentTicketsTable tickets={mergedTickets as any} />
        </div>
    );
}


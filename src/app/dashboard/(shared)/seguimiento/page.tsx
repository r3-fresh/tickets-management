import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { desc, sql, and, not, eq } from "drizzle-orm";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@/components/shared/breadcrumb";

const TicketsList = dynamic(
    () => import("@/components/tickets/tickets-list").then(mod => ({ default: mod.TicketsList })),
    {
        loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
    }
);

export default async function () {
    const session = await requireAuth();

    // Both queries are independent — run in parallel
    const [watchedTickets, ticketsWithRelations] = await Promise.all([
        // Fetch tickets where user is a watcher BUT NOT the creator
        db.select({
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
            .where(
                and(
                    not(eq(tickets.createdById, session.user.id)),
                    sql`${session.user.id} = ANY(${tickets.watchers})`
                )
            )
            .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
            .orderBy(desc(tickets.createdAt)),
        // Fetch assigned users and creators separately
        db.query.tickets.findMany({
            where: and(
                not(eq(tickets.createdById, session.user.id)),
                sql`${session.user.id} = ANY(${tickets.watchers})`
            ),
            with: {
                assignedTo: true,
                createdBy: true,
            },
            orderBy: [desc(tickets.createdAt)],
        }),
    ]);

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

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "En seguimiento" }]} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">En seguimiento</h1>
                <p className="text-muted-foreground mt-1">
                    Tickets donde estás asignado como observador
                </p>
            </div>

            <TicketsList
                tickets={mergedTickets}
                isAdmin={session.user.role === "admin"}
                isWatchedView={true}
                hideHeader={true}
            />
        </div>
    );
}

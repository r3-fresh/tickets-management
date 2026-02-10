import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories } from "@/db/schema";
import { getSession } from "@/lib/auth/helpers";
import { desc, sql, eq, and } from "drizzle-orm";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@/components/shared/breadcrumb";

const AdminTicketsTable = dynamic(
    () => import("@/components/admin/admin-tickets-table").then(mod => ({ default: mod.AdminTicketsTable })),
    {
        loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
    }
);

export default async function () {
    // Authorization handled by (admin) layout
    const session = await getSession();
    if (!session?.user) return null;

    // Both queries are independent — run in parallel
    const [allTicketsWithUnread, ticketsWithRelations] = await Promise.all([
        // Fetch ALL tickets with unread count for current admin
        db.select({
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
            .orderBy(desc(tickets.createdAt)),
        // Fetch relations separately
        db.query.tickets.findMany({
            columns: { id: true },
            with: {
                createdBy: true,
                assignedTo: true,
            },
            orderBy: [desc(tickets.createdAt)],
        }),
    ]);

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
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Explorador de tickets" }]} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Explorador de tickets</h1>
                <p className="text-muted-foreground mt-1">
                    Gestión completa de todos los tickets del sistema
                </p>
            </div>

            <AdminTicketsTable tickets={mergedTickets} />
        </div>
    );
}

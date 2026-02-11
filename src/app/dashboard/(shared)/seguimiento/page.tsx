import { db } from "@/db";
import { tickets } from "@/db/schema";
import { queryTicketsWithUnread } from "@/db/queries";
import { requireAuth } from "@/lib/auth/helpers";
import { desc, sql, and, not, eq } from "drizzle-orm";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "En seguimiento",
};

const TicketsList = dynamic(
    () => import("@/components/tickets/tickets-list").then(mod => ({ default: mod.TicketsList })),
    {
        loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
    }
);

export default async function SeguimientoPage() {
    const session = await requireAuth();

    const watchedWhere = and(
        not(eq(tickets.createdById, session.user.id)),
        sql`${session.user.id} = ANY(${tickets.watchers})`
    );

    // Both queries are independent — run in parallel
    const [watchedTickets, ticketsWithRelations] = await Promise.all([
        queryTicketsWithUnread(session.user.id, watchedWhere),
        // Fetch assigned users and creators separately
        db.query.tickets.findMany({
            where: watchedWhere,
            columns: { id: true },
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

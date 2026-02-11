import { db } from "@/db";
import { tickets } from "@/db/schema";
import { queryTicketsWithUnread } from "@/db/queries";
import { getSession } from "@/lib/auth/helpers";
import { desc } from "drizzle-orm";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explorador de tickets",
};

const AdminTicketsTable = dynamic(
    () => import("@/components/admin/admin-tickets-table").then(mod => ({ default: mod.AdminTicketsTable })),
    {
        loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
    }
);

export default async function ExploradorPage() {
    // Authorization handled by (admin) layout
    const session = await getSession();
    if (!session?.user) return null;

    // Both queries are independent — run in parallel
    const [allTicketsWithUnread, ticketsWithRelations] = await Promise.all([
        queryTicketsWithUnread(session.user.id),
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

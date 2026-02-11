import { db } from "@/db";
import { tickets } from "@/db/schema";
import { queryTicketsPaginated, getTicketFilterOptions } from "@/db/queries";
import type { TicketFilterParams } from "@/db/queries";
import { getSession } from "@/lib/auth/helpers";
import { desc, inArray } from "drizzle-orm";
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

interface PageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExploradorPage({ searchParams }: PageProps) {
    // Authorization handled by (admin) layout
    const session = await getSession();
    if (!session?.user) return null;

    const params = await searchParams;
    const filters: TicketFilterParams = {
        status: typeof params.status === "string" ? params.status : undefined,
        assignedTo: typeof params.assignedTo === "string" ? params.assignedTo : undefined,
        category: typeof params.category === "string" ? params.category : undefined,
        search: typeof params.search === "string" ? params.search : undefined,
        year: typeof params.year === "string" ? params.year : undefined,
        dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : undefined,
        dateTo: typeof params.dateTo === "string" ? params.dateTo : undefined,
        page: typeof params.page === "string" ? Number(params.page) : 1,
        perPage: typeof params.perPage === "string" ? Number(params.perPage) : 25,
    };

    // Tres queries independientes en paralelo
    const [paginatedResult, filterOptions, ticketsWithRelations] = await Promise.all([
        queryTicketsPaginated(session.user.id, filters),
        getTicketFilterOptions(),
        // Fetch relations para los tickets paginados se hace después
        // Primero obtenemos los IDs de los tickets paginados
        Promise.resolve(null), // placeholder
    ]);

    // Fetch relations solo para los IDs de la página actual
    const ticketIds = paginatedResult.rows.map(t => t.id);
    const relationsData = ticketIds.length > 0
        ? await db.query.tickets.findMany({
            where: inArray(tickets.id, ticketIds),
            columns: { id: true },
            with: {
                createdBy: true,
                assignedTo: true,
            },
        })
        : [];

    // Merge
    const mergedTickets = paginatedResult.rows.map((ticket) => {
        const withRelations = relationsData.find((t) => t.id === ticket.id);
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

            <AdminTicketsTable
                tickets={mergedTickets}
                totalCount={paginatedResult.totalCount}
                assignedUsers={filterOptions.assignedUsers}
                categories={filterOptions.categories}
            />
        </div>
    );
}

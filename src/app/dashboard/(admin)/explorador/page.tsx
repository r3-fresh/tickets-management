import { db } from "@/db";
import { tickets } from "@/db/schema";
import { queryTicketsPaginated, getTicketFilterOptions } from "@/db/queries";
import type { TicketFilterParams } from "@/db/queries";
import { getSession } from "@/lib/auth/helpers";
import { inArray } from "drizzle-orm";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explorador de tickets",
};

interface PageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExploradorPage({ searchParams }: PageProps) {
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
        perPage: typeof params.perPage === "string" ? Number(params.perPage) : 10,
    };

    const [paginatedResult, filterOptions] = await Promise.all([
        queryTicketsPaginated(session.user.id, filters),
        getTicketFilterOptions(),
    ]);

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

    const mergedTickets = paginatedResult.rows.map((ticket) => {
        const withRelations = relationsData.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            createdBy: withRelations?.createdBy || null,
            assignedTo: withRelations?.assignedTo || null,
        };
    });

    return (
        <div className="flex flex-col gap-6">
            <Breadcrumb items={[{ label: "Explorador de tickets" }]} />

            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Explorador de tickets</h1>
                <p className="text-sm text-muted-foreground mt-1">
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

import { AdminTicketsTable } from "@/components/admin/admin-tickets-table";

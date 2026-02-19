import { db } from "@/db";
import { tickets } from "@/db/schema";
import { queryTicketsPaginated, getTicketFilterOptions } from "@/db/queries";
import type { TicketFilterParams } from "@/db/queries";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, inArray } from "drizzle-orm";
import { TicketsList } from "@/components/tickets/tickets-list";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mis tickets",
};

interface PageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MisTicketsPage({ searchParams }: PageProps) {
    const session = await requireAuth();

    const params = await searchParams;
    const filters: TicketFilterParams = {
        status: typeof params.status === "string" ? params.status : undefined,
        assignedTo: typeof params.assignedTo === "string" ? params.assignedTo : undefined,
        category: typeof params.category === "string" ? params.category : undefined,
        subcategory: typeof params.subcategory === "string" ? params.subcategory : undefined,
        search: typeof params.search === "string" ? params.search : undefined,
        year: typeof params.year === "string" ? params.year : undefined,
        dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : undefined,
        dateTo: typeof params.dateTo === "string" ? params.dateTo : undefined,
        page: typeof params.page === "string" ? Number(params.page) : 1,
        perPage: typeof params.perPage === "string" ? Number(params.perPage) : 10,
    };

    const baseWhere = eq(tickets.createdById, session.user.id);

    // Queries independientes en paralelo
    const [paginatedResult, filterOptions] = await Promise.all([
        queryTicketsPaginated(session.user.id, filters, baseWhere),
        getTicketFilterOptions(baseWhere),
    ]);

    // Fetch relations solo para los IDs de la página actual
    const ticketIds = paginatedResult.rows.map(t => t.id);
    const relationsData = ticketIds.length > 0
        ? await db.query.tickets.findMany({
            where: inArray(tickets.id, ticketIds),
            columns: { id: true },
            with: {
                assignedTo: true,
                createdBy: true,
            },
        })
        : [];

    // Merge
    const mergedTickets = paginatedResult.rows.map((ticket) => {
        const withAssigned = relationsData.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
            createdBy: withAssigned?.createdBy || null,
        };
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Mis tickets" }]} />

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis tickets</h1>
                    <p className="text-muted-foreground mt-1">
                        Todos los tickets que has creado
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/tickets/nuevo" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Crear nuevo ticket
                    </Link>
                </Button>
            </div>

            <TicketsList
                tickets={mergedTickets}
                totalCount={paginatedResult.totalCount}
                isAdmin={session.user.role === "admin"}
                hideHeader={true}
                assignedUsers={filterOptions.assignedUsers}
                categories={filterOptions.categories}
                subcategories={filterOptions.subcategories}
            />
        </div>
    );
}

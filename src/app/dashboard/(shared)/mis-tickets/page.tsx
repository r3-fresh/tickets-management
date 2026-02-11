import { db } from "@/db";
import { tickets } from "@/db/schema";
import { queryTicketsWithUnread } from "@/db/queries";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, desc } from "drizzle-orm";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mis tickets",
};

const TicketsList = dynamic(
    () => import("@/components/tickets/tickets-list").then(mod => ({ default: mod.TicketsList })),
    {
        loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
    }
);
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function MisTicketsPage() {
    const session = await requireAuth();

    // Both queries are independent — run in parallel
    const [userTickets, ticketsWithAssigned] = await Promise.all([
        queryTicketsWithUnread(
            session.user.id,
            eq(tickets.createdById, session.user.id),
        ),
        // Fetch assigned users separately
        db.query.tickets.findMany({
            where: eq(tickets.createdById, session.user.id),
            columns: { id: true },
            with: {
                assignedTo: true,
            },
            orderBy: [desc(tickets.createdAt)],
        }),
    ]);

    // Merge unread counts with assigned user data
    const mergedTickets = userTickets.map((ticket) => {
        const withAssigned = ticketsWithAssigned.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
            commentCount: ticket.commentCount,
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
                isAdmin={session.user.role === "admin"}
                hideHeader={true}
            />
        </div>
    );
}

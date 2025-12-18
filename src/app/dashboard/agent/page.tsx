import { db } from "@/db";
import { tickets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { AgentTicketsTable } from "./agent-tickets-table";

export default async function AgentDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch ALL tickets
    const allTickets = await db.query.tickets.findMany({
        with: {
            createdBy: true,
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Bandeja de Tickets</h1>
            <AgentTicketsTable tickets={allTickets} />
        </div>
    );
}

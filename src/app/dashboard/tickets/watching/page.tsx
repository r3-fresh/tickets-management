import { db } from "@/db";
import { tickets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, sql, and, not, eq } from "drizzle-orm";
import { TicketsList } from "../tickets-list";

export default async function WatchedTicketsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch tickets where user is a watcher BUT NOT the creator
    const watchedTickets = await db
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
            unreadCommentCount: sql<number>`cast(0 as integer)`, // TODO: implement later
        })
        .from(tickets)
        .where(
            and(
                not(eq(tickets.createdById, session.user.id)), // NOT created by me
                sql`${session.user.id} = ANY(${tickets.watchers})` // I am a watcher
            )
        )
        .orderBy(desc(tickets.createdAt));

    // Fetch assigned users and creators separately
    const ticketsWithRelations = await db.query.tickets.findMany({
        where: and(
            not(eq(tickets.createdById, session.user.id)),
            sql`${session.user.id} = ANY(${tickets.watchers})`
        ),
        with: {
            assignedTo: true,
            createdBy: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    // Merge with relation data
    const mergedTickets = watchedTickets.map((ticket) => {
        const withRelations = ticketsWithRelations.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withRelations?.assignedTo || null,
            createdBy: withRelations?.createdBy || null,
        };
    });

    return <TicketsList tickets={mergedTickets} isAdmin={(session.user as any).role === "admin"} isWatchedView={true} />;
}

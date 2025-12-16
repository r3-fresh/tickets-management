import { db } from "@/db";
import { tickets, comments, ticketViews } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc, sql, and, gt } from "drizzle-orm";
import { TicketsList } from "./tickets-list";

export default async function TicketsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch tickets with unread comment count
    const userTickets = await db
        .select({
            id: tickets.id,
            title: tickets.title,
            description: tickets.description,
            status: tickets.status,
            priority: tickets.priority,
            categoryId: tickets.categoryId,
            subcategory: tickets.subcategory,
            createdById: tickets.createdById,
            assignedToId: tickets.assignedToId,
            ccEmails: tickets.ccEmails,
            createdAt: tickets.createdAt,
            updatedAt: tickets.updatedAt,
            unreadCommentCount: sql<number>`
                cast(
                    count(
                        case 
                            when ${comments.createdAt} > coalesce(${ticketViews.lastViewedAt}, ${tickets.createdAt})
                            then 1 
                        end
                    ) as integer
                )
            `,
        })
        .from(tickets)
        .leftJoin(comments, eq(tickets.id, comments.ticketId))
        .leftJoin(
            ticketViews,
            and(
                eq(tickets.id, ticketViews.ticketId),
                eq(ticketViews.userId, session.user.id)
            )
        )
        .where(eq(tickets.createdById, session.user.id))
        .groupBy(tickets.id, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt));

    // Fetch assigned users separately
    const ticketsWithAssigned = await db.query.tickets.findMany({
        where: eq(tickets.createdById, session.user.id),
        with: {
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    // Merge unread counts with assigned user data
    const mergedTickets = userTickets.map((ticket) => {
        const withAssigned = ticketsWithAssigned.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
        };
    });

    return <TicketsList tickets={mergedTickets} isAdmin={(session.user as any).role === "admin"} />;
}

import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories, attentionAreas } from "@/db/schema";
import { getSession } from "@/lib/auth/helpers";
import { eq, desc, sql, and } from "drizzle-orm";
import { TicketsList } from "@/components/tickets/tickets-list";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default async function () {
    // Authorization handled by (agent) layout
    const session = await getSession();
    if (!session?.user) return null;

    if (!session.user.attentionAreaId) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Error de configuración</h1>
                <p className="mt-2 text-gray-600">
                    Tu usuario tiene rol de agente pero no tiene un área de atención asignada.
                    Contacta al administrador.
                </p>
            </div>
        );
    }

    const { attentionAreaId } = session.user;

    // All three queries are independent — run in parallel
    const [areaDetails, areaTickets, ticketsWithAssigned] = await Promise.all([
        // Fetch details of the attention area
        db.query.attentionAreas.findFirst({
            where: eq(attentionAreas.id, attentionAreaId),
        }),
        // Fetch tickets for this attention area
        db.select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            title: tickets.title,
            description: tickets.description,
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
            .where(eq(tickets.attentionAreaId, attentionAreaId))
            .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
            .orderBy(desc(tickets.createdAt)),
        // Fetch assigned users
        db.query.tickets.findMany({
            where: eq(tickets.attentionAreaId, attentionAreaId),
            with: {
                assignedTo: true,
            },
            orderBy: [desc(tickets.createdAt)],
        }),
    ]);

    const mergedTickets = areaTickets.map((ticket) => {
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
            <Breadcrumb items={[{ label: "Tickets del área" }]} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tickets del área</h1>
                <p className="text-muted-foreground mt-1">
                    Gestión completa de tickets para {areaDetails?.name || "tu área"}
                </p>
            </div>

            <TicketsList
                tickets={mergedTickets}
                isAdmin={session.user.role === "admin"}
                isAgent={true}
                hideHeader={true}
            />
        </div>
    );
}

import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories, users, attentionAreas } from "@/db/schema";
import { requireAgent } from "@/lib/utils/server-auth";
import { eq, desc, sql, and, or, count } from "drizzle-orm";
import { TicketsList } from "@/components/tickets/tickets-list";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Ticket,
    CheckCircle2,
    Clock,
    AlertCircle,
    Activity
} from "lucide-react";

export default async function AgentTicketsPage() {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Error de Configuración</h1>
                <p className="mt-2 text-gray-600">
                    Tu usuario tiene rol de Agente pero no tiene un Área de Atención asignada.
                    Contacta al administrador.
                </p>
            </div>
        );
    }

    const { attentionAreaId } = session.user;

    // Fetch details of the attention area
    const areaDetails = await db.query.attentionAreas.findFirst({
        where: eq(attentionAreas.id, attentionAreaId),
    });

    // --- Statistics Gathering ---

    // Total Tickets for this area
    const [totalTicketsRes] = await db
        .select({ count: count() })
        .from(tickets)
        .where(eq(tickets.attentionAreaId, attentionAreaId));

    // Tickets by Status for this area
    const statusStats = await db.select({
        status: tickets.status,
        count: count()
    })
        .from(tickets)
        .where(eq(tickets.attentionAreaId, attentionAreaId))
        .groupBy(tickets.status);

    const getStat = (status: string) => statusStats.find(s => s.status === status)?.count || 0;

    const statsCards = [
        {
            title: "Total Tickets",
            value: totalTicketsRes.count,
            icon: Ticket,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20"
        },
        {
            title: "Abiertos",
            value: getStat("open"),
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/20"
        },
        {
            title: "En Proceso",
            value: getStat("in_progress"),
            icon: Clock,
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/20"
        },
        {
            title: "Resueltos",
            value: getStat("resolved"),
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/20"
        }
    ];

    // Fetch tickets for this attention area
    const areaTickets = await db
        .select({
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
        .orderBy(desc(tickets.createdAt));

    // Fetch assigned users
    const ticketsWithAssigned = await db.query.tickets.findMany({
        where: eq(tickets.attentionAreaId, attentionAreaId),
        with: {
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard de Agente</h1>
                    <p className="text-muted-foreground">
                        Gestión de tickets para {areaDetails?.name || "tu área"}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-2">
                <TicketsList
                    tickets={mergedTickets}
                    isAdmin={false} // Agents are not full admins
                    isAgent={true}  // Pass isAgent prop
                />
            </div>
        </div>
    );
}

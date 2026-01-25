import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories, users, attentionAreas } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { eq, desc, sql, and, or, count } from "drizzle-orm";
import { TicketsList } from "@/components/tickets/tickets-list";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Ticket,
    CheckCircle2,
    Clock,
    AlertCircle,
    Activity,
    ArrowRight
} from "lucide-react";

export default async function AgentDashboardPage() {
    const session = await requireAgent();

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
            title: "Total tickets",
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
            title: "En proceso",
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

    // Fetch RECENT tickets for this attention area (last 10)
    const recentAreaTickets = await db
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
        .orderBy(desc(tickets.createdAt))
        .limit(10); // Only recent 10

    // Fetch assigned users for recent tickets
    const ticketIds = recentAreaTickets.map(t => t.id);
    const ticketsWithAssigned = await db.query.tickets.findMany({
        where: eq(tickets.attentionAreaId, attentionAreaId),
        with: {
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    const mergedTickets = recentAreaTickets.map((ticket) => {
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
                    <h1 className="text-3xl font-bold tracking-tight">Mi panel</h1>
                    <p className="text-muted-foreground">
                        Vista rápida de {areaDetails?.name || "tu área"}
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

            {/* Recent Tickets */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Tickets recientes del área</h2>
                        <p className="text-sm text-muted-foreground">Últimos 10 tickets</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/agente/tickets-area" className="flex items-center gap-2">
                            Ver todos los tickets del área
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <TicketsList
                    tickets={mergedTickets}
                    isAdmin={false}
                    isAgent={true}
                />
            </div>
        </div>
    );
}

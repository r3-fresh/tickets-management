import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, desc, sql, and, not, count } from "drizzle-orm";
import { TicketsList } from "@/components/tickets/tickets-list";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Ticket,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    HourglassIcon,
    Plus,
    Users
} from "lucide-react";

export default async function UserDashboardPage() {
    const session = await requireAuth();

    // --- Statistics Gathering ---

    // Tickets by Status for this user
    const statusStats = await db.select({
        status: tickets.status,
        count: count()
    })
        .from(tickets)
        .where(eq(tickets.createdById, session.user.id))
        .groupBy(tickets.status);

    const getStat = (status: string) => statusStats.find(s => s.status === status)?.count || 0;

    // Count tickets where user is a watcher
    const [watcherCountResult] = await db
        .select({ count: count() })
        .from(tickets)
        .where(sql`${session.user.id} = ANY(${tickets.watchers})`);

    const statsCards = [
        {
            title: "Tickets abiertos",
            value: getStat("open"),
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/20",
            change: null
        },
        {
            title: "En progreso",
            value: getStat("in_progress"),
            icon: Clock,
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/20",
            change: null
        },
        {
            title: "Pendientes de validación",
            value: getStat("pending_validation"),
            icon: HourglassIcon,
            color: "text-yellow-600",
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
            change: null
        },
        {
            title: "Asignado como observador",
            value: watcherCountResult?.count || 0,
            icon: Eye,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
            change: null
        }
    ];

    // --- Fetch RECENT tickets created by user (last 5 for quick view) ---
    const recentUserTickets = await db
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
        .where(eq(tickets.createdById, session.user.id))
        .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt))
        .limit(5);

    // Fetch assigned users for recent tickets
    const ticketsWithAssigned = await db.query.tickets.findMany({
        where: eq(tickets.createdById, session.user.id),
        with: {
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
        limit: 5,
    });

    const mergedRecentTickets = recentUserTickets.map((ticket) => {
        const withAssigned = ticketsWithAssigned.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
            commentCount: ticket.commentCount,
        };
    });

    // --- Fetch RECENT watched tickets (last 3 for quick view) ---
    const recentWatchedTickets = await db
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
        .where(
            and(
                not(eq(tickets.createdById, session.user.id)),
                sql`${session.user.id} = ANY(${tickets.watchers})`
            )
        )
        .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt))
        .limit(3);

    const watchedTicketsWithRelations = await db.query.tickets.findMany({
        where: and(
            not(eq(tickets.createdById, session.user.id)),
            sql`${session.user.id} = ANY(${tickets.watchers})`
        ),
        with: {
            assignedTo: true,
            createdBy: true,
        },
        orderBy: [desc(tickets.createdAt)],
        limit: 3,
    });

    const mergedWatchedTickets = recentWatchedTickets.map((ticket) => {
        const withRelations = watchedTicketsWithRelations.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withRelations?.assignedTo || null,
            createdBy: withRelations?.createdBy || null,
            commentCount: ticket.commentCount,
        };
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Resumen de tickets" }]} />

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resumen de tickets</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona y rastrea tus solicitudes de soporte y aprobaciones.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/tickets/nuevo" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Crear nuevo ticket
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            {stat.change && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.change}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* My Recent Tickets */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Mis tickets</h2>
                    </div>
                    <Button asChild variant="link" className="text-primary">
                        <Link href="/dashboard/usuario/mis-tickets">
                            Ver todo el historial
                        </Link>
                    </Button>
                </div>

                <TicketsList
                    tickets={mergedRecentTickets}
                    isAdmin={false}
                    hideFilters={true}
                    hideHeader={true}
                />
            </div>

            {/* Watched Tickets */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">En seguimiento</h2>
                        {mergedWatchedTickets.length > 0 && (
                            <Badge variant="secondary">{mergedWatchedTickets.length} elementos</Badge>
                        )}
                    </div>
                    {mergedWatchedTickets.length > 0 && (
                        <Button asChild variant="link" className="text-primary">
                            <Link href="/dashboard/usuario/seguimiento">
                                Ver todo
                            </Link>
                        </Button>
                    )}
                </div>

                {mergedWatchedTickets.length > 0 ? (
                    <TicketsList
                        tickets={mergedWatchedTickets}
                        isAdmin={false}
                        isWatchedView={true}
                        hideFilters={true}
                        hideHeader={true}
                    />
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No estás siguiendo ningún ticket aún</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

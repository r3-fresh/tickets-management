import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories, attentionAreas } from "@/db/schema";
import { eq, desc, sql, and, not, count } from "drizzle-orm";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@/components/shared/breadcrumb";

const TicketsList = dynamic(
    () => import("@/components/tickets/tickets-list").then(mod => ({ default: mod.TicketsList })),
    {
        loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
    }
);
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
    AlertCircle,
    Clock,
    Eye,
    HourglassIcon,
    Users,
    Building2,
    Plus
} from "lucide-react";

interface AgentDashboardProps {
    userId: string;
    attentionAreaId: number;
}

export async function AgentDashboard({ userId, attentionAreaId }: AgentDashboardProps) {
    // All queries are independent — run in parallel
    const [
        areaDetails,
        areaStatusStats,
        userStatusStats,
        [watcherCountResult],
        recentAreaTickets,
        areaTicketsWithAssigned,
        recentUserTickets,
        userTicketsWithAssigned,
        recentWatchedTickets,
        watchedTicketsWithRelations,
    ] = await Promise.all([
        // Fetch details of the attention area
        db.query.attentionAreas.findFirst({
            where: eq(attentionAreas.id, attentionAreaId),
        }),
        // AREA Statistics
        db.select({ status: tickets.status, count: count() })
            .from(tickets)
            .where(eq(tickets.attentionAreaId, attentionAreaId))
            .groupBy(tickets.status),
        // USER Statistics
        db.select({ status: tickets.status, count: count() })
            .from(tickets)
            .where(eq(tickets.createdById, userId))
            .groupBy(tickets.status),
        // Count tickets where user is a watcher
        db.select({ count: count() })
            .from(tickets)
            .where(sql`${userId} = ANY(${tickets.watchers})`),
        // Recent area tickets (last 5)
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
                                and ${comments.userId} != ${userId}
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
            .leftJoin(ticketViews, and(eq(tickets.id, ticketViews.ticketId), eq(ticketViews.userId, userId)))
            .where(eq(tickets.attentionAreaId, attentionAreaId))
            .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
            .orderBy(desc(tickets.createdAt))
            .limit(5),
        // Area tickets with assigned
        db.query.tickets.findMany({
            where: eq(tickets.attentionAreaId, attentionAreaId),
            with: { assignedTo: true },
            orderBy: [desc(tickets.createdAt)],
            limit: 5,
        }),
        // Recent user tickets (last 3)
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
                                and ${comments.userId} != ${userId}
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
            .leftJoin(ticketViews, and(eq(tickets.id, ticketViews.ticketId), eq(ticketViews.userId, userId)))
            .where(eq(tickets.createdById, userId))
            .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
            .orderBy(desc(tickets.createdAt))
            .limit(3),
        // User tickets with assigned
        db.query.tickets.findMany({
            where: eq(tickets.createdById, userId),
            with: { assignedTo: true },
            orderBy: [desc(tickets.createdAt)],
            limit: 3,
        }),
        // Recent watched tickets (last 3)
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
                                and ${comments.userId} != ${userId}
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
            .leftJoin(ticketViews, and(eq(tickets.id, ticketViews.ticketId), eq(ticketViews.userId, userId)))
            .where(and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`))
            .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
            .orderBy(desc(tickets.createdAt))
            .limit(3),
        // Watched tickets with relations
        db.query.tickets.findMany({
            where: and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`),
            with: { assignedTo: true, createdBy: true },
            orderBy: [desc(tickets.createdAt)],
            limit: 3,
        }),
    ]);

    const getAreaStat = (status: string) => areaStatusStats.find(s => s.status === status)?.count || 0;
    const getUserStat = (status: string) => userStatusStats.find(s => s.status === status)?.count || 0;

    // Merge ticket data with relation data
    const mergedAreaTickets = recentAreaTickets.map((ticket) => {
        const withAssigned = areaTicketsWithAssigned.find((t) => t.id === ticket.id);
        return { ...ticket, assignedTo: withAssigned?.assignedTo || null, commentCount: ticket.commentCount };
    });

    const mergedUserTickets = recentUserTickets.map((ticket) => {
        const withAssigned = userTicketsWithAssigned.find((t) => t.id === ticket.id);
        return { ...ticket, assignedTo: withAssigned?.assignedTo || null, commentCount: ticket.commentCount };
    });

    const mergedWatchedTickets = recentWatchedTickets.map((ticket) => {
        const withRelations = watchedTicketsWithRelations.find((t) => t.id === ticket.id);
        return { ...ticket, assignedTo: withRelations?.assignedTo || null, createdBy: withRelations?.createdBy || null, commentCount: ticket.commentCount };
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Mi panel" }]} />

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi panel</h1>
                    <p className="text-muted-foreground mt-1">
                        Vista rápida de {areaDetails?.name || "tu área"}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/tickets/nuevo" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Crear nuevo ticket
                    </Link>
                </Button>
            </div>

            {/* Statistics Grid - Simplified */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Area Stats */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Área de atención</h3>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Abiertos
                                </CardTitle>
                                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{getAreaStat("open")}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    En proceso
                                </CardTitle>
                                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{getAreaStat("in_progress")}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* User Stats */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Mis tickets personales</h3>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Abiertos
                                </CardTitle>
                                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{getUserStat("open")}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pendientes
                                </CardTitle>
                                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                    <HourglassIcon className="h-4 w-4 text-yellow-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{getUserStat("pending_validation")}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Area Tickets Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Tickets recientes del área</h2>
                    </div>
                    <Button asChild variant="link" className="text-primary">
                        <Link href="/dashboard/area">
                            Ver todo el historial
                        </Link>
                    </Button>
                </div>

                <TicketsList
                    tickets={mergedAreaTickets}
                    isAdmin={false}
                    isAgent={true}
                    hideFilters={true}
                    hideHeader={true}
                />
            </div>

            {/* My Tickets Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Mis tickets</h2>
                    </div>
                    <Button asChild variant="link" className="text-primary">
                        <Link href="/dashboard/mis-tickets">
                            Ver todo el historial
                        </Link>
                    </Button>
                </div>

                <TicketsList
                    tickets={mergedUserTickets}
                    isAdmin={false}
                    hideFilters={true}
                    hideHeader={true}
                />
            </div>

            {/* Watched Tickets Table */}
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
                            <Link href="/dashboard/seguimiento">
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

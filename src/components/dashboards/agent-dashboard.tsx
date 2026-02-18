import { db } from "@/db";
import { tickets, attentionAreas } from "@/db/schema";
import { eq, desc, sql, and, not, count, inArray } from "drizzle-orm";
import { queryTicketsWithUnread } from "@/db/queries";
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

const ACTIVE_STATUSES = ["open", "in_progress", "pending_validation"] as const;

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
        // Recent area tickets (last 5, active only)
        queryTicketsWithUnread(userId, and(eq(tickets.attentionAreaId, attentionAreaId), inArray(tickets.status, [...ACTIVE_STATUSES])), 5),
        // Area tickets with assigned (active only)
        db.query.tickets.findMany({
            where: and(eq(tickets.attentionAreaId, attentionAreaId), inArray(tickets.status, [...ACTIVE_STATUSES])),
            columns: { id: true },
            with: { assignedTo: true, createdBy: true },
            orderBy: [desc(tickets.createdAt)],
            limit: 5,
        }),
        // Recent user tickets (last 3, active only)
        queryTicketsWithUnread(userId, and(eq(tickets.createdById, userId), inArray(tickets.status, [...ACTIVE_STATUSES])), 3),
        // User tickets with assigned (active only)
        db.query.tickets.findMany({
            where: and(eq(tickets.createdById, userId), inArray(tickets.status, [...ACTIVE_STATUSES])),
            columns: { id: true },
            with: { assignedTo: true, createdBy: true },
            orderBy: [desc(tickets.createdAt)],
            limit: 3,
        }),
        // Recent watched tickets (last 3, active only)
        queryTicketsWithUnread(userId, and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`, inArray(tickets.status, [...ACTIVE_STATUSES])), 3),
        // Watched tickets with relations (active only)
        db.query.tickets.findMany({
            where: and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`, inArray(tickets.status, [...ACTIVE_STATUSES])),
            columns: { id: true },
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
        return { ...ticket, assignedTo: withAssigned?.assignedTo || null, createdBy: withAssigned?.createdBy || null, commentCount: ticket.commentCount };
    });

    const mergedUserTickets = recentUserTickets.map((ticket) => {
        const withAssigned = userTicketsWithAssigned.find((t) => t.id === ticket.id);
        return { ...ticket, assignedTo: withAssigned?.assignedTo || null, createdBy: withAssigned?.createdBy || null, commentCount: ticket.commentCount };
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
                                <div className="p-2 rounded-full bg-muted">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
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
                                <div className="p-2 rounded-full bg-muted">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
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
                                <div className="p-2 rounded-full bg-muted">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
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
                                <div className="p-2 rounded-full bg-muted">
                                    <HourglassIcon className="h-4 w-4 text-muted-foreground" />
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
                    <Button asChild variant="link" className="text-primary">
                        <Link href="/dashboard/seguimiento">
                            Ver todo el historial
                        </Link>
                    </Button>
                </div>

                <TicketsList
                    tickets={mergedWatchedTickets}
                    isAdmin={false}
                    isWatchedView={true}
                    hideFilters={true}
                    hideHeader={true}
                />
            </div>
        </div>
    );
}

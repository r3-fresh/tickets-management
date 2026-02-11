import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq, desc, sql, and, not, count } from "drizzle-orm";
import { queryTicketsWithUnread } from "@/db/queries";
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
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    HourglassIcon,
    Plus,
    Users
} from "lucide-react";

interface UserDashboardProps {
    userId: string;
}

export async function UserDashboard({ userId }: UserDashboardProps) {
    // --- All independent queries in parallel ---
    const [
        statusStats,
        [watcherCountResult],
        recentUserTickets,
        ticketsWithAssigned,
        recentWatchedTickets,
        watchedTicketsWithRelations,
    ] = await Promise.all([
        // Tickets by Status for this user
        db.select({
            status: tickets.status,
            count: count()
        })
            .from(tickets)
            .where(eq(tickets.createdById, userId))
            .groupBy(tickets.status),
        // Count tickets where user is a watcher
        db.select({ count: count() })
            .from(tickets)
            .where(sql`${userId} = ANY(${tickets.watchers})`),
        // Recent user tickets (last 5)
        queryTicketsWithUnread(userId, eq(tickets.createdById, userId), 5),
        // User tickets with assigned
        db.query.tickets.findMany({
            where: eq(tickets.createdById, userId),
            columns: { id: true },
            with: {
                assignedTo: true,
            },
            orderBy: [desc(tickets.createdAt)],
            limit: 5,
        }),
        // Recent watched tickets (last 3)
        queryTicketsWithUnread(userId, and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`), 3),
        // Watched tickets with relations
        db.query.tickets.findMany({
            where: and(
                not(eq(tickets.createdById, userId)),
                sql`${userId} = ANY(${tickets.watchers})`
            ),
            columns: { id: true },
            with: {
                assignedTo: true,
                createdBy: true,
            },
            orderBy: [desc(tickets.createdAt)],
            limit: 3,
        }),
    ]);

    const getStat = (status: string) => statusStats.find(s => s.status === status)?.count || 0;

    const mergedRecentTickets = recentUserTickets.map((ticket) => {
        const withAssigned = ticketsWithAssigned.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
            commentCount: ticket.commentCount,
        };
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

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Mi panel" }]} />

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi panel</h1>
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
                        <Link href="/dashboard/mis-tickets">
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

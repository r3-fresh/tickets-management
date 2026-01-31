import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories, attentionAreas } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
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
    Users,
    Building2,
    Plus
} from "lucide-react";

export default async function () {
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

    // --- AREA Statistics (Tickets of the area) ---
    const areaStatusStats = await db.select({
        status: tickets.status,
        count: count()
    })
        .from(tickets)
        .where(eq(tickets.attentionAreaId, attentionAreaId))
        .groupBy(tickets.status);

    const getAreaStat = (status: string) => areaStatusStats.find(s => s.status === status)?.count || 0;

    // --- USER Statistics (My tickets as user) ---
    const userStatusStats = await db.select({
        status: tickets.status,
        count: count()
    })
        .from(tickets)
        .where(eq(tickets.createdById, session.user.id))
        .groupBy(tickets.status);

    const getUserStat = (status: string) => userStatusStats.find(s => s.status === status)?.count || 0;

    // Count tickets where user is a watcher
    const [watcherCountResult] = await db
        .select({ count: count() })
        .from(tickets)
        .where(sql`${session.user.id} = ANY(${tickets.watchers})`);

    const areaStatsCards = [
        {
            title: "Abiertos",
            value: getAreaStat("open"),
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/20",
        },
        {
            title: "En proceso",
            value: getAreaStat("in_progress"),
            icon: Clock,
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/20",
        },
        {
            title: "Resueltos",
            value: getAreaStat("resolved"),
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/20",
        }
    ];

    const userStatsCards = [
        {
            title: "Abiertos",
            value: getUserStat("open"),
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/20",
        },
        {
            title: "Pendientes de validación",
            value: getUserStat("pending_validation"),
            icon: HourglassIcon,
            color: "text-yellow-600",
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
        },
        {
            title: "En progreso",
            value: getUserStat("in_progress"),
            icon: Clock,
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/20",
        }
    ];

    // --- Fetch RECENT area tickets (last 5) ---
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
        .limit(5);

    const areaTicketsWithAssigned = await db.query.tickets.findMany({
        where: eq(tickets.attentionAreaId, attentionAreaId),
        with: {
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
        limit: 5,
    });

    const mergedAreaTickets = recentAreaTickets.map((ticket) => {
        const withAssigned = areaTicketsWithAssigned.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
            commentCount: ticket.commentCount,
        };
    });

    // --- Fetch RECENT user tickets (last 3) ---
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
        .limit(3);

    const userTicketsWithAssigned = await db.query.tickets.findMany({
        where: eq(tickets.createdById, session.user.id),
        with: {
            assignedTo: true,
        },
        orderBy: [desc(tickets.createdAt)],
        limit: 3,
    });

    const mergedUserTickets = recentUserTickets.map((ticket) => {
        const withAssigned = userTicketsWithAssigned.find((t) => t.id === ticket.id);
        return {
            ...ticket,
            assignedTo: withAssigned?.assignedTo || null,
            commentCount: ticket.commentCount,
        };
    });

    // --- Fetch RECENT watched tickets (last 3) ---
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
                        <Link href="/dashboard/agente/tickets-area">
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
                        <Link href="/dashboard/agente/mis-tickets">
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
                            <Link href="/dashboard/agente/seguimiento">
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

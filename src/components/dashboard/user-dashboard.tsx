import { db } from "@/db";
import { tickets } from "@/db/schema";
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
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  HourglassIcon,
  Plus,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface UserDashboardProps {
  userId: string;
}

const USER_ACTIVE_STATUSES = ["open", "in_progress", "pending_validation"] as const;

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export async function UserDashboard({ userId }: UserDashboardProps) {
  const [
    statusStats,
    [watcherCountResult],
    recentUserTickets,
    ticketsWithAssigned,
    recentWatchedTickets,
    watchedTicketsWithRelations,
  ] = await Promise.all([
    db.select({ status: tickets.status, count: count() })
      .from(tickets)
      .where(eq(tickets.createdById, userId))
      .groupBy(tickets.status),
    db.select({ count: count() })
      .from(tickets)
      .where(sql`${userId} = ANY(${tickets.watchers})`),
    queryTicketsWithUnread(userId, and(eq(tickets.createdById, userId), inArray(tickets.status, [...USER_ACTIVE_STATUSES])), 5),
    db.query.tickets.findMany({
      where: and(eq(tickets.createdById, userId), inArray(tickets.status, [...USER_ACTIVE_STATUSES])),
      columns: { id: true },
      with: { assignedTo: true, createdBy: true },
      orderBy: [desc(tickets.createdAt)],
      limit: 5,
    }),
    queryTicketsWithUnread(userId, and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`, inArray(tickets.status, [...USER_ACTIVE_STATUSES])), 3),
    db.query.tickets.findMany({
      where: and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`, inArray(tickets.status, [...USER_ACTIVE_STATUSES])),
      columns: { id: true },
      with: { assignedTo: true, createdBy: true },
      orderBy: [desc(tickets.createdAt)],
      limit: 3,
    }),
  ]);

  const getStat = (status: string) => statusStats.find(s => s.status === status)?.count || 0;

  const totalTickets = statusStats.reduce((sum, s) => sum + s.count, 0);
  const resolvedCount = getStat("resolved");
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;
  const activeCount = getStat("open") + getStat("in_progress") + getStat("pending_validation");

  const mergedRecentTickets = recentUserTickets.map((ticket) => {
    const withAssigned = ticketsWithAssigned.find((t) => t.id === ticket.id);
    return { ...ticket, assignedTo: withAssigned?.assignedTo || null, createdBy: withAssigned?.createdBy || null, commentCount: ticket.commentCount };
  });

  const mergedWatchedTickets = recentWatchedTickets.map((ticket) => {
    const withRelations = watchedTicketsWithRelations.find((t) => t.id === ticket.id);
    return { ...ticket, assignedTo: withRelations?.assignedTo || null, createdBy: withRelations?.createdBy || null, commentCount: ticket.commentCount };
  });

  const kpiCards = [
    {
      label: "Tickets abiertos",
      value: getStat("open"),
      icon: AlertCircle,
      barColor: "bg-orange-500",
      max: activeCount || 1,
      iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    },
    {
      label: "En progreso",
      value: getStat("in_progress"),
      icon: Clock,
      barColor: "bg-blue-500",
      max: activeCount || 1,
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Pend. validación",
      value: getStat("pending_validation"),
      icon: HourglassIcon,
      barColor: "bg-yellow-500",
      max: activeCount || 1,
      iconBg: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400",
    },
    {
      label: "Resueltos",
      value: resolvedCount,
      icon: CheckCircle2,
      barColor: "bg-emerald-500",
      max: totalTickets || 1,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "En seguimiento",
      value: watcherCountResult?.count || 0,
      icon: Eye,
      barColor: "bg-purple-500",
      max: totalTickets || 1,
      iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      label: "Tasa de resolución",
      value: `${resolutionRate}%`,
      rawValue: resolutionRate,
      icon: TrendingUp,
      barColor: resolutionRate >= 70 ? "bg-emerald-500" : resolutionRate >= 40 ? "bg-yellow-500" : "bg-red-500",
      max: 100,
      iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Mi panel" }]} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi panel</h1>
          <p className="text-muted-foreground mt-1">Gestiona y rastrea tus solicitudes de soporte.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tickets/nuevo" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear nuevo ticket
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map(({ label, value, rawValue, icon: Icon, barColor, max, iconBg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", iconBg)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground leading-tight mb-1">{label}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <MiniBar value={rawValue ?? (value as number)} max={max} color={barColor} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Tickets Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Mis tickets recientes</h2>
          </div>
          <Button asChild variant="link" className="text-primary">
            <Link href="/dashboard/mis-tickets">Ver todo el historial</Link>
          </Button>
        </div>
        <TicketsList tickets={mergedRecentTickets} isAdmin={false} hideFilters={true} hideHeader={true} />
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
          <Button asChild variant="link" className="text-primary">
            <Link href="/dashboard/seguimiento">Ver todo el historial</Link>
          </Button>
        </div>
        <TicketsList tickets={mergedWatchedTickets} isAdmin={false} isWatchedView={true} hideFilters={true} hideHeader={true} />
      </div>
    </div>
  );
}

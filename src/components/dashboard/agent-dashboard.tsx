import { db } from "@/db";
import { tickets, attentionAreas } from "@/db/schema";
import { eq, desc, sql, and, not, count, inArray } from "drizzle-orm";
import { queryTickets } from "@/db/queries";
import { TicketsList } from "@/components/tickets/tickets-list";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  Eye,
  HourglassIcon,
  Users,
  Building2,
  Plus,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AgentDashboardProps {
  userId: string;
  attentionAreaId: number;
}

const ACTIVE_STATUSES = ["open", "in_progress"] as const;
const USER_ACTIVE_STATUSES = ["open", "in_progress", "pending_validation"] as const;

/** Returns avg days between createdAt and closedAt for resolved tickets */
function avgDays(ms: number | null): string {
  if (!ms || ms <= 0) return "—";
  return ms.toFixed(1);
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export async function AgentDashboard({ userId, attentionAreaId }: AgentDashboardProps) {
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
    [areaAvgTimeRes],
    [userAvgTimeRes],
  ] = await Promise.all([
    db.query.attentionAreas.findFirst({ where: eq(attentionAreas.id, attentionAreaId) }),
    db.select({ status: tickets.status, count: count() })
      .from(tickets)
      .where(eq(tickets.attentionAreaId, attentionAreaId))
      .groupBy(tickets.status),
    db.select({ status: tickets.status, count: count() })
      .from(tickets)
      .where(eq(tickets.createdById, userId))
      .groupBy(tickets.status),
    db.select({ count: count() })
      .from(tickets)
      .where(sql`${userId} = ANY(${tickets.watchers})`),
    queryTickets(and(eq(tickets.attentionAreaId, attentionAreaId), inArray(tickets.status, [...ACTIVE_STATUSES])), 5),
    db.query.tickets.findMany({
      where: and(eq(tickets.attentionAreaId, attentionAreaId), inArray(tickets.status, [...ACTIVE_STATUSES])),
      columns: { id: true },
      with: { assignedTo: true, createdBy: true },
      orderBy: [desc(tickets.createdAt)],
      limit: 5,
    }),
    queryTickets(and(eq(tickets.createdById, userId), inArray(tickets.status, [...USER_ACTIVE_STATUSES])), 3),
    db.query.tickets.findMany({
      where: and(eq(tickets.createdById, userId), inArray(tickets.status, [...USER_ACTIVE_STATUSES])),
      columns: { id: true },
      with: { assignedTo: true, createdBy: true },
      orderBy: [desc(tickets.createdAt)],
      limit: 3,
    }),
    queryTickets(and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`, inArray(tickets.status, [...USER_ACTIVE_STATUSES])), 3),
    db.query.tickets.findMany({
      where: and(not(eq(tickets.createdById, userId)), sql`${userId} = ANY(${tickets.watchers})`, inArray(tickets.status, [...USER_ACTIVE_STATUSES])),
      columns: { id: true },
      with: { assignedTo: true, createdBy: true },
      orderBy: [desc(tickets.createdAt)],
      limit: 3,
    }),
    // Avg attention days for area (resolved tickets with closedAt)
    db.select({
      avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${tickets.closedAt} - ${tickets.createdAt})) / 86400), 0)`,
    })
      .from(tickets)
      .where(and(eq(tickets.attentionAreaId, attentionAreaId), eq(tickets.status, "resolved"), sql`${tickets.closedAt} IS NOT NULL`)),
    // Avg attention days for user's created tickets
    db.select({
      avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${tickets.closedAt} - ${tickets.createdAt})) / 86400), 0)`,
    })
      .from(tickets)
      .where(and(eq(tickets.createdById, userId), eq(tickets.status, "resolved"), sql`${tickets.closedAt} IS NOT NULL`)),
  ]);

  const getAreaStat = (status: string) => areaStatusStats.find(s => s.status === status)?.count || 0;
  const getUserStat = (status: string) => userStatusStats.find(s => s.status === status)?.count || 0;

  const areaTotalTickets = areaStatusStats.reduce((sum, s) => sum + s.count, 0);
  const areaActiveCount = getAreaStat("open") + getAreaStat("in_progress");
  const areaResolvedCount = getAreaStat("resolved");
  const areaResolutionRate = areaTotalTickets > 0 ? Math.round((areaResolvedCount / areaTotalTickets) * 100) : 0;

  const userActiveCount = getUserStat("open") + getUserStat("in_progress") + getUserStat("pending_validation");
  const userTotalTickets = userStatusStats.reduce((sum, s) => sum + s.count, 0);
  const userResolvedCount = getUserStat("resolved");
  const userResolutionRate = userTotalTickets > 0 ? Math.round((userResolvedCount / userTotalTickets) * 100) : 0;

  const areaAvgTime = Number(areaAvgTimeRes?.avgDays ?? 0);
  const userAvgTime = Number(userAvgTimeRes?.avgDays ?? 0);

  const areaKPIs = [
    { label: "Abiertos", value: getAreaStat("open"), max: areaActiveCount || 1, barColor: "bg-orange-500", iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400", icon: AlertCircle },
    { label: "En proceso", value: getAreaStat("in_progress"), max: areaActiveCount || 1, barColor: "bg-blue-500", iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400", icon: Clock },
    { label: "Resueltos", value: areaResolvedCount, max: areaTotalTickets || 1, barColor: "bg-emerald-500", iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400", icon: CheckCircle2 },
    { label: "Tasa resolución", value: `${areaResolutionRate}%`, rawValue: areaResolutionRate, max: 100, barColor: areaResolutionRate >= 70 ? "bg-emerald-500" : areaResolutionRate >= 40 ? "bg-yellow-500" : "bg-red-500", iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400", icon: TrendingUp },
    { label: "T. prom. atención", value: areaAvgTime > 0 ? `${avgDays(areaAvgTime)}d` : "—", rawValue: 0, max: 1, barColor: "bg-indigo-500", iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400", icon: Users },
  ];

  const userKPIs = [
    { label: "Abiertos", value: getUserStat("open"), max: userActiveCount || 1, barColor: "bg-orange-500", iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400", icon: AlertCircle },
    { label: "En proceso", value: getUserStat("in_progress"), max: userActiveCount || 1, barColor: "bg-blue-500", iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400", icon: Clock },
    { label: "Pend. validación", value: getUserStat("pending_validation"), max: userActiveCount || 1, barColor: "bg-yellow-500", iconBg: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400", icon: HourglassIcon },
    { label: "En seguimiento", value: watcherCountResult?.count || 0, max: userTotalTickets || 1, barColor: "bg-purple-500", iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400", icon: Eye },
    { label: "Resueltos", value: userResolvedCount, max: userTotalTickets || 1, barColor: "bg-emerald-500", iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400", icon: CheckCircle2 },
    { label: "Tasa resolución", value: `${userResolutionRate}%`, rawValue: userResolutionRate, max: 100, barColor: userResolutionRate >= 70 ? "bg-emerald-500" : userResolutionRate >= 40 ? "bg-yellow-500" : "bg-red-500", iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400", icon: TrendingUp },
    { label: "T. prom. atención", value: userAvgTime > 0 ? `${avgDays(userAvgTime)}d` : "—", rawValue: 0, max: 1, barColor: "bg-indigo-500", iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400", icon: Users },
  ];

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
      <Breadcrumb items={[{ label: "Mi panel" }]} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi panel</h1>
          <p className="text-muted-foreground mt-1">Vista rápida de {areaDetails?.name || "tu área"}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tickets/nuevo" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear nuevo ticket
          </Link>
        </Button>
      </div>

      {/* Area KPIs */}
      <CollapsibleSection
        id="agent-area-kpis"
        icon={<Building2 className="h-5 w-5 text-muted-foreground shrink-0" />}
        title={`Tickets del área · ${areaDetails?.name || ""}`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {areaKPIs.map(({ label, value, rawValue, max, barColor, iconBg, icon: Icon }) => (
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
      </CollapsibleSection>

      {/* Personal KPIs */}
      <CollapsibleSection
        id="agent-personal-kpis"
        icon={<Users className="h-5 w-5 text-muted-foreground shrink-0" />}
        title="Mis tickets personales"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {userKPIs.map(({ label, value, rawValue, max, barColor, iconBg, icon: Icon }) => (
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
      </CollapsibleSection>

      {/* Area Tickets Table */}
      <CollapsibleSection
        id="agent-area-tickets"
        icon={<Building2 className="h-5 w-5 text-muted-foreground shrink-0" />}
        title="Tickets recientes del área"
        headerRight={
          <Button asChild variant="link" className="text-primary">
            <Link href="/dashboard/area">Ver todo el historial</Link>
          </Button>
        }
      >
        <TicketsList tickets={mergedAreaTickets} isAdmin={false} isAgent={true} hideFilters={true} hideHeader={true} />
      </CollapsibleSection>

      {/* My Tickets Table */}
      <CollapsibleSection
        id="agent-my-tickets"
        icon={<Users className="h-5 w-5 text-muted-foreground shrink-0" />}
        title="Mis tickets recientes"
        headerRight={
          <Button asChild variant="link" className="text-primary">
            <Link href="/dashboard/mis-tickets">Ver todo el historial</Link>
          </Button>
        }
      >
        <TicketsList tickets={mergedUserTickets} isAdmin={false} hideFilters={true} hideHeader={true} />
      </CollapsibleSection>

      {/* Watched Tickets */}
      <CollapsibleSection
        id="agent-watched-tickets"
        icon={<Eye className="h-5 w-5 text-muted-foreground shrink-0" />}
        title={`En seguimiento${mergedWatchedTickets.length > 0 ? ` (${mergedWatchedTickets.length})` : ""}`}
        headerRight={
          <Button asChild variant="link" className="text-primary">
            <Link href="/dashboard/seguimiento">Ver todo el historial</Link>
          </Button>
        }
      >
        <TicketsList tickets={mergedWatchedTickets} isAdmin={false} isWatchedView={true} hideFilters={true} hideHeader={true} />
      </CollapsibleSection>
    </div>
  );
}

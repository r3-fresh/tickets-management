import { db } from "@/db";
import { tickets, users, comments, attentionAreas } from "@/db/schema";
import { sql, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users as UsersIcon,
  MessageSquare,
  Activity,
  Building2,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AreaBarChart } from "@/components/dashboard/charts/area-bar-chart";
import type { AreaBarData } from "@/components/dashboard/charts/area-bar-chart";

export async function AdminDashboard() {
  // --- Statistics Gathering (parallelized) ---

  const [
    [totalTicketsRes],
    statusStats,
    usersByRole,
    [totalAreasRes],
    [totalCommentsRes],
    recentUsers,
    ticketsByArea,
  ] = await Promise.all([
    db.select({ count: count() }).from(tickets),
    db.select({ status: tickets.status, count: count() }).from(tickets).groupBy(tickets.status),
    db.select({ role: users.role, count: count() }).from(users).groupBy(users.role),
    db.select({ count: count() }).from(attentionAreas),
    db.select({ count: count() }).from(comments),
    db.query.users.findMany({ limit: 5, orderBy: (users, { desc }) => [desc(users.createdAt)] }),
    // Tickets by area + status for chart
    db.select({
      areaId: tickets.attentionAreaId,
      status: tickets.status,
      count: count(),
    })
      .from(tickets)
      .where(sql`${tickets.attentionAreaId} IS NOT NULL`)
      .groupBy(tickets.attentionAreaId, tickets.status),
  ]);

  const getStat = (status: string) => statusStats.find(s => s.status === status)?.count || 0;
  const getUsersStat = (role: string) => usersByRole.find(r => r.role === role)?.count || 0;

  // Resolve area names
  const uniqueAreaIds = [...new Set(ticketsByArea.map(t => t.areaId!))].filter(Boolean);
  const areasWithTickets = uniqueAreaIds.length > 0
    ? await db.query.attentionAreas.findMany({
      where: (areas, { inArray }) => inArray(areas.id, uniqueAreaIds),
    })
    : [];

  // Build grouped bar data
  const areaBarData: AreaBarData[] = areasWithTickets.map((area) => {
    const getAreaStatusCount = (st: string) =>
      ticketsByArea.find((t) => t.areaId === area.id && t.status === st)?.count ?? 0;
    return {
      area: area.name,
      Abiertos: getAreaStatusCount("open"),
      "En proceso": getAreaStatusCount("in_progress"),
      "Pend. validación": getAreaStatusCount("pending_validation"),
      Resueltos: getAreaStatusCount("resolved"),
    };
  }).sort((a, b) =>
    (b.Abiertos + b["En proceso"] + b["Pend. validación"] + b.Resueltos) -
    (a.Abiertos + a["En proceso"] + a["Pend. validación"] + a.Resueltos)
  );

  const mainStatsCards = [
    {
      title: "Total de tickets",
      value: totalTicketsRes.count,
      icon: Ticket,
    },
    {
      title: "Abiertos",
      value: getStat("open"),
      icon: AlertCircle,
    },
    {
      title: "En proceso",
      value: getStat("in_progress"),
      icon: Clock,
    },
    {
      title: "Resueltos",
      value: getStat("resolved"),
      icon: CheckCircle2,
    }
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumb items={[{ label: "Panel de control" }]} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-muted-foreground mt-1">Bienvenido, administrador. Aquí tienes un resumen del sistema.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStatsCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-full bg-muted">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* System Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad del sistema</CardTitle>
            <CardDescription>Estadísticas de participación y comunidad</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center">
              <div className="bg-muted p-3 rounded-full mr-4">
                <UsersIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Usuarios totales</p>
                <p className="text-sm text-muted-foreground">
                  {getUsersStat("user")} usuarios • {getUsersStat("agent")} agentes • {getUsersStat("admin")} admins
                </p>
              </div>
              <div className="text-2xl font-bold">{getUsersStat("user") + getUsersStat("agent") + getUsersStat("admin")}</div>
            </div>

            <div className="flex items-center">
              <div className="bg-muted p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Actividad total</p>
                <p className="text-sm text-muted-foreground">Comentarios y eventos en tickets</p>
              </div>
              <div className="text-2xl font-bold">{totalCommentsRes.count}</div>
            </div>

            <div className="flex items-center">
              <div className="bg-muted p-3 rounded-full mr-4">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Áreas de atención</p>
                <p className="text-sm text-muted-foreground">Departamentos activos del sistema</p>
              </div>
              <div className="text-2xl font-bold">{totalAreasRes.count}</div>
            </div>

            <div className="flex items-center">
              <div className="bg-muted p-3 rounded-full mr-4">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Tickets anulados</p>
                <p className="text-sm text-muted-foreground">Solicitudes que no procedieron</p>
              </div>
              <div className="text-2xl font-bold">{getStat("voided")}</div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users List */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Usuarios recientes</CardTitle>
            <CardDescription>Últimos usuarios que se unieron al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image || undefined} alt={user.name || "User"} referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-muted-foreground/80 text-background font-bold">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{user.name || "Sin nombre"}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user.role === "admin" ? "Administrador" : user.role === "agent" ? "Agente" : "Usuario"}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets by Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tickets por área y estado
          </CardTitle>
          <CardDescription>Distribución de tickets activos por departamento</CardDescription>
        </CardHeader>
        <CardContent>
          <AreaBarChart data={areaBarData} />
        </CardContent>
      </Card>
    </div>
  );
}

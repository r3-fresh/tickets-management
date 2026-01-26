import { db } from "@/db";
import { tickets, users, comments, attentionAreas } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { sql, count, eq } from "drizzle-orm";
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
    UserCheck,
    TrendingUp
} from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminDashboardPage() {
    const session = await requireAdmin();

    // --- Statistics Gathering ---

    // Total Tickets
    const [totalTicketsRes] = await db.select({ count: count() }).from(tickets);

    // Tickets by Status
    const statusStats = await db.select({
        status: tickets.status,
        count: count()
    }).from(tickets).groupBy(tickets.status);

    const getStat = (status: string) => statusStats.find(s => s.status === status)?.count || 0;

    // Total Users by Role
    const usersByRole = await db.select({
        role: users.role,
        count: count()
    }).from(users).groupBy(users.role);

    const getUsersStat = (role: string) => usersByRole.find(r => r.role === role)?.count || 0;

    // Total Areas
    const [totalAreasRes] = await db.select({ count: count() }).from(attentionAreas);

    // Total Comments
    const [totalCommentsRes] = await db.select({ count: count() }).from(comments);

    // Recent Users (Last 5)
    const recentUsers = await db.query.users.findMany({
        limit: 5,
        orderBy: (users, { desc }) => [desc(users.createdAt)]
    });

    // Tickets by area
    const ticketsByArea = await db.select({
        areaId: tickets.attentionAreaId,
        count: count()
    })
        .from(tickets)
        .where(sql`${tickets.attentionAreaId} IS NOT NULL`)
        .groupBy(tickets.attentionAreaId)
        .limit(5);

    const areasWithTickets = await db.query.attentionAreas.findMany({
        where: (areas, { inArray }) => inArray(areas.id, ticketsByArea.map(t => t.areaId!)),
    });

    const topAreas = ticketsByArea.map(stat => {
        const area = areasWithTickets.find(a => a.id === stat.areaId);
        return {
            name: area?.name || "Desconocida",
            count: stat.count
        };
    }).sort((a, b) => b.count - a.count);

    const mainStatsCards = [
        {
            title: "Total de tickets",
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
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
                            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full mr-4">
                                <UsersIcon className="h-6 w-6 text-purple-600" />
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
                            <div className="bg-cyan-100 dark:bg-cyan-900/20 p-3 rounded-full mr-4">
                                <MessageSquare className="h-6 w-6 text-cyan-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Comentarios totales</p>
                                <p className="text-sm text-muted-foreground">Interacciones en hilos de soporte</p>
                            </div>
                            <div className="text-2xl font-bold">{totalCommentsRes.count}</div>
                        </div>

                        <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full mr-4">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Áreas de atención</p>
                                <p className="text-sm text-muted-foreground">Departamentos activos del sistema</p>
                            </div>
                            <div className="text-2xl font-bold">{totalAreasRes.count}</div>
                        </div>

                        <div className="flex items-center">
                            <div className="bg-rose-100 dark:bg-rose-900/20 p-3 rounded-full mr-4">
                                <Activity className="h-6 w-6 text-rose-600" />
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
                                        <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white">
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

            {/* Top Areas by Tickets */}
            {topAreas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Áreas más activas
                        </CardTitle>
                        <CardDescription>Departamentos con mayor volumen de tickets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topAreas.map((area, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm mr-4">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{area.name}</p>
                                    </div>
                                    <div className="text-sm font-bold">{area.count} tickets</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

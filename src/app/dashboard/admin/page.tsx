import { db } from "@/db";
import { tickets, users, comments } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq, sql, count } from "drizzle-orm";
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
    Users,
    MessageSquare,
    Activity
} from "lucide-react";
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

    // Total Users
    const [totalUsersRes] = await db.select({ count: count() }).from(users);

    // Total Comments
    const [totalCommentsRes] = await db.select({ count: count() }).from(comments);

    // Recent Users (Last 5 joined or active)
    const recentUsers = await db.query.users.findMany({
        limit: 5,
        orderBy: (users, { desc }) => [desc(users.createdAt)]
    });

    const statsCards = [
        {
            title: "Total Tickets",
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
            title: "En Proceso",
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                <p className="text-muted-foreground">Bienvenido, administrador. Aquí tienes un resumen del sistema.</p>
            </div>

            {/* Main Stats Grid */}
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Secondary Stats */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Actividad del Sistema</CardTitle>
                        <CardDescription>Estadísticas de participación y comunidad.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-8">
                        <div className="flex items-center">
                            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full mr-4">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Usuarios registrados</p>
                                <p className="text-sm text-muted-foreground">Usuarios únicos con acceso al portal.</p>
                            </div>
                            <div className="text-2xl font-bold">{totalUsersRes.count}</div>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-cyan-100 dark:bg-cyan-900/20 p-3 rounded-full mr-4">
                                <MessageSquare className="h-6 w-6 text-cyan-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Comentarios totales</p>
                                <p className="text-sm text-muted-foreground">Interacciones en hilos de soporte.</p>
                            </div>
                            <div className="text-2xl font-bold">{totalCommentsRes.count}</div>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-rose-100 dark:bg-rose-900/20 p-3 rounded-full mr-4">
                                <Activity className="h-6 w-6 text-rose-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Tickets Anulados</p>
                                <p className="text-sm text-muted-foreground">Solicitudes que no procedieron.</p>
                            </div>
                            <div className="text-2xl font-bold">{getStat("voided")}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Users List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Usuarios Recientes</CardTitle>
                        <CardDescription>Últimos usuarios que se unieron al sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.image || undefined} referrerPolicy="no-referrer" />
                                        <AvatarFallback className="bg-slate-200 dark:bg-slate-800">
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs text-muted-foreground italic">
                                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                        </p>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

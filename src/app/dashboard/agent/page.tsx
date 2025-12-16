
import { db } from "@/db";
import { tickets, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AgentDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // In a real app, enforce 'agent' or 'admin' role here
    // if (session.user.role !== 'agent') redirect("/dashboard");

    // Fetch ALL tickets
    const allTickets = await db.query.tickets.findMany({
        with: {
            createdBy: true,
        },
        orderBy: [desc(tickets.createdAt)],
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bandeja de Entrada (Agentes)</h1>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Asunto</TableHead>
                            <TableHead>Solicitante</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No hay tickets registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            allTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">#{ticket.id}</TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline font-medium text-blue-600">
                                            {ticket.title}
                                        </Link>
                                        <div className="text-xs text-gray-500">{ticket.subcategory}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={ticket.createdBy.image || ""} />
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{ticket.createdBy.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{ticket.priority}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                                            {ticket.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {format(ticket.createdAt, "dd MMM", { locale: es })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}


import { db } from "@/db";
import { tickets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    open: { label: "Abierto", color: "bg-green-100 text-green-800" },
    in_progress: { label: "En Curso", color: "bg-blue-100 text-blue-800" },
    resolved: { label: "Resuelto", color: "bg-gray-100 text-gray-800" },
    voided: { label: "Anulado", color: "bg-red-100 text-red-800" },
};

const PRIORITY_MAP: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    critical: "Crítica",
};

export default async function TicketsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const userTickets = await db.select()
        .from(tickets)
        .where(eq(tickets.createdById, session.user.id))
        .orderBy(desc(tickets.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mis Tickets</h1>
                <Button asChild>
                    <Link href="/dashboard/tickets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Ticket
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Asunto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No has creado ningún ticket aún.
                                </TableCell>
                            </TableRow>
                        ) : (
                            userTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">#{ticket.id}</TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline font-medium text-blue-600">
                                            {ticket.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{ticket.subcategory}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{PRIORITY_MAP[ticket.priority]}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[ticket.status]?.color || "bg-gray-100"}`}>
                                            {STATUS_MAP[ticket.status]?.label || ticket.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {format(ticket.createdAt, "dd MMM yyyy", { locale: es })}
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

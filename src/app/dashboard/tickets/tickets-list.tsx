"use client";

import { useState, useMemo } from "react";
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
import { Plus, MessageCircle } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { CopyLinkButton } from "./copy-link-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TicketFilters } from "./ticket-filters";
import { DateRange } from "react-day-picker";

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

interface Ticket {
    id: number;
    title: string;
    subcategory: string | null;
    priority: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    assignedTo: { id: string; name: string; image: string | null } | null;
    unreadCommentCount?: number;
}

interface TicketsListProps {
    tickets: Ticket[];
    isAdmin: boolean;
}

export function TicketsList({ tickets, isAdmin }: TicketsListProps) {
    const [filters, setFilters] = useState<{
        status?: string;
        assignedTo?: string;
        dateRange?: DateRange;
    }>({});

    // Get unique assigned users for filter
    const assignedUsers = useMemo(() => {
        const users = tickets
            .filter((t) => t.assignedTo)
            .map((t) => t.assignedTo!)
            .filter((user, index, self) =>
                index === self.findIndex((u) => u.id === user.id)
            );
        return users;
    }, [tickets]);

    // Filter tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            // Status filter
            if (filters.status && ticket.status !== filters.status) {
                return false;
            }

            // Assigned to filter
            if (filters.assignedTo) {
                if (filters.assignedTo === "unassigned" && ticket.assignedTo) {
                    return false;
                }
                if (filters.assignedTo !== "unassigned" && ticket.assignedTo?.id !== filters.assignedTo) {
                    return false;
                }
            }

            // Date range filter
            if (filters.dateRange?.from) {
                const ticketDate = new Date(ticket.createdAt);
                const from = filters.dateRange.from;
                const to = filters.dateRange.to || from;

                if (!isWithinInterval(ticketDate, { start: from, end: to })) {
                    return false;
                }
            }

            return true;
        });
    }, [tickets, filters]);

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

            <TicketFilters onFilterChange={setFilters} assignedUsers={assignedUsers} />

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Asunto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead className="text-center w-[100px]">Comentarios</TableHead>
                            <TableHead className="text-right">Fecha</TableHead>
                            <TableHead className="text-center w-[100px]">Compartir</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    {tickets.length === 0
                                        ? "No has creado ningún ticket aún."
                                        : "No se encontraron tickets con los filtros aplicados."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket) => (
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
                                    <TableCell>
                                        {ticket.assignedTo ? (
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={ticket.assignedTo.image || ""} />
                                                    <AvatarFallback>{ticket.assignedTo.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{ticket.assignedTo.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Sin asignar</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {ticket.unreadCommentCount && ticket.unreadCommentCount > 0 ? (
                                            <div className="flex items-center justify-center space-x-1">
                                                <MessageCircle className="h-4 w-4 text-blue-500" fill="currentColor" />
                                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                                                    {ticket.unreadCommentCount} nuevo{ticket.unreadCommentCount > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        ) : null}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {format(ticket.createdAt, "dd MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <CopyLinkButton ticketId={ticket.id} />
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

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
import { CopyLinkButton } from "./copy-link-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TicketFilters } from "./ticket-filters";
import { DateRange } from "react-day-picker";
import { formatDate, translateStatus, translatePriority } from "@/lib/utils/format";
import { isWithinInterval } from "date-fns";

interface Ticket {
    id: number;
    ticketCode: string;
    title: string;
    subcategory: string | null;
    priority: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    assignedTo: { id: string; name: string; image: string | null } | null;
    createdBy?: { id: string; name: string; image: string | null } | null;
    unreadCommentCount?: number;
}

interface TicketsListProps {
    tickets: Ticket[];
    isAdmin: boolean;
    isWatchedView?: boolean;
}

export function TicketsList({ tickets, isAdmin, isWatchedView = false }: TicketsListProps) {
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
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {isWatchedView ? "Tickets Observados" : "Mis Tickets"}
                </h1>
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
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Asunto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>{isWatchedView ? "Solicitante" : "Asignado a"}</TableHead>
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
                                        ? isWatchedView
                                            ? "No estás observando ningún ticket."
                                            : "No has creado ningún ticket aún."
                                        : "No se encontraron tickets con los filtros aplicados."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium text-xs text-gray-500">
                                        {ticket.ticketCode || `#${ticket.id}`}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline font-medium text-blue-600">
                                            {ticket.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{ticket.subcategory}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{translatePriority(ticket.priority)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    ticket.status === 'resolved' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {translateStatus(ticket.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {isWatchedView ? (
                                            ticket.createdBy ? (
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={ticket.createdBy.image || undefined} />
                                                        <AvatarFallback>{ticket.createdBy.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{ticket.createdBy.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Desconocido</span>
                                            )
                                        ) : (
                                            ticket.assignedTo ? (
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={ticket.assignedTo.image || undefined} />
                                                        <AvatarFallback>{ticket.assignedTo.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{ticket.assignedTo.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Sin asignar</span>
                                            )
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
                                        {formatDate(ticket.createdAt)}
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

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
import { differenceInDays } from "date-fns";
import { MessageCircle } from "lucide-react";
import { CopyLinkButton } from "@/app/dashboard/tickets/copy-link-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TicketFilters } from "@/app/dashboard/tickets/ticket-filters";
import { DateRange } from "react-day-picker";
import { formatDate, translateStatus, translatePriority } from "@/lib/utils/format";
import { isWithinInterval } from "date-fns";

interface Ticket {
    id: number;
    ticketCode: string;
    title: string;
    subcategoryId: number | null;
    categoryName: string | null;
    areaId: number | null;
    campusId: number | null;
    priority: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    assignedTo: { id: string; name: string; image: string | null } | null;
    createdBy?: { id: string; name: string; image: string | null } | null;
    unreadCommentCount?: number;
    commentCount?: number;
}

interface AdminTicketsTableProps {
    tickets: Ticket[];
}

export function AdminTicketsTable({ tickets }: AdminTicketsTableProps) {
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
            <TicketFilters onFilterChange={setFilters} assignedUsers={assignedUsers} />

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Código</TableHead>
                            <TableHead>Asunto</TableHead>
                            <TableHead>Solicitante</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead className="text-center">Comentarios</TableHead>
                            <TableHead className="text-right">Fecha Ref.</TableHead>
                            <TableHead className="text-center w-[50px]">Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No se encontraron tickets con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket) => {
                                const daysOpen = differenceInDays(new Date(), new Date(ticket.createdAt));
                                return (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium text-xs text-gray-500">
                                            {ticket.ticketCode}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline font-medium text-blue-600">
                                                {ticket.title}
                                            </Link>
                                            {ticket.categoryName && (
                                                <div className="text-xs text-gray-500">{ticket.categoryName}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={ticket.createdBy?.image || undefined} />
                                                    <AvatarFallback className="bg-cyan-600 text-white text-[10px] font-bold">
                                                        {ticket.createdBy?.name.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm truncate max-w-[100px]" title={ticket.createdBy?.name}>
                                                    {ticket.createdBy?.name}
                                                </span>
                                            </div>
                                        </TableCell>
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
                                            {ticket.assignedTo ? (
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={ticket.assignedTo.image || undefined} />
                                                        <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                                                            {ticket.assignedTo.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm truncate max-w-[100px]" title={ticket.assignedTo.name}>
                                                        {ticket.assignedTo.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground whitespace-nowrap">Sin asignar</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    <span className="text-xs">{ticket.commentCount || 0}</span>
                                                </div>
                                                {ticket.unreadCommentCount !== undefined && ticket.unreadCommentCount > 0 && (
                                                    <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                                                        {ticket.unreadCommentCount} nuevo{ticket.unreadCommentCount > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground whitespace-nowrap text-xs">
                                            {formatDate(ticket.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <CopyLinkButton ticketId={ticket.id} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

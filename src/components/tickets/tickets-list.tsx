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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle } from "lucide-react";
import { differenceInDays } from "date-fns";
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
    subcategoryId: number | null;
    categoryId: number | null;
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

interface TicketsListProps {
    tickets: Ticket[];
    isAdmin: boolean;
    isWatchedView?: boolean;
    isAgent?: boolean;
    hideFilters?: boolean;
    hideHeader?: boolean;
}

export function TicketsList({ tickets, isAdmin, isWatchedView = false, isAgent = false, hideFilters = false, hideHeader = false }: TicketsListProps) {
    const [filters, setFilters] = useState<{
        status?: string;
        assignedTo?: string;
        dateRange?: DateRange;
        category?: string;
        year?: string;
    }>({});
    const [searchQuery, setSearchQuery] = useState("");

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

    // Get unique categories for filter
    const categories = useMemo(() => {
        const categoriesMap = new Map<number, string>();
        tickets.forEach(ticket => {
            if (ticket.categoryId && ticket.categoryName) {
                categoriesMap.set(ticket.categoryId, ticket.categoryName);
            }
        });
        return Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));
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

            // Category filter
            if (filters.category && ticket.categoryId?.toString() !== filters.category) {
                return false;
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

            // Year filter
            if (filters.year && filters.year !== "all") {
                const ticketYear = new Date(ticket.createdAt).getFullYear().toString();
                if (ticketYear !== filters.year) {
                    return false;
                }
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesCode = ticket.ticketCode.toLowerCase().includes(query);
                const matchesTitle = ticket.title.toLowerCase().includes(query);
                if (!matchesCode && !matchesTitle) {
                    return false;
                }
            }

            return true;
        });
    }, [tickets, filters, searchQuery]);

    return (
        <div className="space-y-4">
            {!hideHeader && (
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isWatchedView ? "Tickets Observados" : (isAgent ? "Bandeja de atención" : "Mis Tickets")}
                    </h1>
                    {!isAdmin && !isWatchedView && !isAgent && (
                        <Button asChild>
                            <Link href="/dashboard/tickets/nuevo">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Ticket
                            </Link>
                        </Button>
                    )}
                </div>
            )}

            {!hideFilters && (
                <>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar por código o título..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    <TicketFilters onFilterChange={setFilters} assignedUsers={assignedUsers} categories={categories} />
                </>
            )}

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Código</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            {isWatchedView && <TableHead>Solicitante</TableHead>}
                            <TableHead>Asignado a</TableHead>
                            <TableHead className="text-center w-[120px]">Comentarios</TableHead>
                            <TableHead className="text-right">Fecha de creación</TableHead>
                            <TableHead className="text-center w-[100px]">Link</TableHead>
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
                                        <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline font-medium text-blue-600 block">
                                            {ticket.title}
                                        </Link>
                                        {ticket.categoryName && (
                                            <div className="text-xs text-muted-foreground mt-0.5">{ticket.categoryName}</div>
                                        )}
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
                                    {isWatchedView && (
                                        <TableCell>
                                            {ticket.createdBy ? (
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={ticket.createdBy.image || undefined} referrerPolicy="no-referrer" />
                                                        <AvatarFallback className="bg-cyan-600 text-white text-[10px] font-bold">
                                                            {ticket.createdBy.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm truncate max-w-[120px]">{ticket.createdBy.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Desconocido</span>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {ticket.assignedTo ? (
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={ticket.assignedTo.image || undefined} referrerPolicy="no-referrer" />
                                                    <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                                                        {ticket.assignedTo.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm truncate max-w-[120px]">{ticket.assignedTo.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Sin asignar</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1 text-muted-foreground">
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

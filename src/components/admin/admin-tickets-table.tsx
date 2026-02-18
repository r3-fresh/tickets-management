"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { CopyLinkButton } from "@/components/tickets/copy-link-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { Pagination } from "@/components/shared/pagination";
import { formatDate, differenceInDays } from "@/lib/utils/format";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface Ticket {
    id: number;
    ticketCode: string;
    title: string;
    subcategoryId: number | null;
    categoryName: string | null;
    categoryId: number | null;
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
    totalCount: number;
    assignedUsers: Array<{ id: string; name: string }>;
    categories: Array<{ id: number; name: string }>;
}

export function AdminTicketsTable({ tickets, totalCount, assignedUsers, categories }: AdminTicketsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get("page") ?? "1");
    const itemsPerPage = Number(searchParams.get("perPage") ?? "25");
    const searchQuery = searchParams.get("search") ?? "";

    const updateParams = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        }
        router.push(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const handlePageChange = useCallback((page: number) => {
        updateParams({ page: page.toString() });
    }, [updateParams]);

    const handleItemsPerPageChange = useCallback((perPage: number) => {
        updateParams({ perPage: perPage.toString(), page: "" });
    }, [updateParams]);

    const debouncedSearch = useDebounce((value: string) => {
        updateParams({ search: value, page: "" });
    }, 400);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Input
                    placeholder="Buscar por código o título..."
                    defaultValue={searchQuery}
                    onChange={handleSearchChange}
                    className="max-w-sm bg-transparent"
                />
            </div>

            <TicketFilters assignedUsers={assignedUsers} categories={categories} />

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Código</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Solicitante</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead className="text-center">Comentarios</TableHead>
                            <TableHead className="text-right">Fecha de creación</TableHead>
                            <TableHead className="text-center w-[50px]">Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No se encontraron tickets con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => {
                                const daysOpen = differenceInDays(new Date(), new Date(ticket.createdAt));
                                return (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium text-xs text-muted-foreground">
                                            {ticket.ticketCode}
                                        </TableCell>
                                        <TableCell>
                                            <Link 
                                                href={`/dashboard/tickets/${ticket.id}`} 
                                                className="hover:underline font-medium text-foreground block truncate max-w-[250px]" 
                                                title={ticket.title}
                                            >
                                                {ticket.title}
                                            </Link>
                                            {ticket.categoryName && (
                                                <div className="text-xs text-muted-foreground truncate">{ticket.categoryName}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <UserAvatar name={ticket.createdBy?.name} image={ticket.createdBy?.image} size="sm" />
                                                <span className="text-sm truncate max-w-[100px]" title={ticket.createdBy?.name}>
                                                    {ticket.createdBy?.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <PriorityBadge priority={ticket.priority} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={ticket.status} />
                                        </TableCell>
                                        <TableCell>
                                            {ticket.assignedTo ? (
                                                <div className="flex items-center space-x-2">
                                                    <UserAvatar name={ticket.assignedTo.name} image={ticket.assignedTo.image} size="sm" />
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
                                                    <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded-full font-medium">
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

            {/* Paginación */}
            {totalCount > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}
        </div>
    );
}

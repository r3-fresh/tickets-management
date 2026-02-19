"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { UserActiveToggle } from "@/components/admin/user-active-toggle";
import { Pagination } from "@/components/shared/pagination";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface AttentionArea {
    id: number;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    image: string | null;
    attentionAreaId?: number | null;
}

interface RolesTableProps {
    users: User[];
    totalCount: number;
    currentUserId: string;
    attentionAreas: AttentionArea[];
}

export function RolesTable({ users, totalCount, currentUserId, attentionAreas }: RolesTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get("page") ?? "1");
    const itemsPerPage = Number(searchParams.get("perPage") ?? "10");
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
        updateParams({ perPage: perPage.toString(), page: "1" });
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
                    placeholder="Buscar por correo o nombre..."
                    defaultValue={searchQuery}
                    onChange={handleSearchChange}
                    className="max-w-sm bg-transparent"
                />
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Rol actual</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {searchQuery ? "No se encontraron usuarios" : "No hay usuarios registrados."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image || ""} referrerPolicy="no-referrer" />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? "default" : "destructive"}>
                                            {user.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={user.role === "admin" ? "default" : user.role === "agent" ? "outline" : "secondary"}>
                                                {user.role === "admin" ? "Administrador" : user.role === "agent" ? "Agente" : "Usuario"}
                                            </Badge>
                                            {user.role === "agent" && user.attentionAreaId && (
                                                <span className="text-xs text-muted-foreground">
                                                    {attentionAreas.find(a => a.id === user.attentionAreaId)?.name}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <UserRoleManager
                                                userId={user.id}
                                                userName={user.name}
                                                currentRole={user.role}
                                                currentAttentionAreaId={user.attentionAreaId}
                                                attentionAreas={attentionAreas}
                                                disabled={user.id === currentUserId}
                                            />
                                            <UserActiveToggle
                                                userId={user.id}
                                                isActive={user.isActive}
                                                disabled={user.id === currentUserId}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
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

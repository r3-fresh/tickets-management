"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RoleToggleButton } from "@/components/admin/role-toggle-button";
import { UserActiveToggle } from "@/components/admin/user-active-toggle";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    image: string | null;
}

interface RolesTableProps {
    users: User[];
    currentUserId: string;
}

export function RolesTable({ users, currentUserId }: RolesTableProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;

        const query = searchQuery.toLowerCase();
        return users.filter(user => {
            const matchesEmail = user.email.toLowerCase().includes(query);
            const matchesName = user.name.toLowerCase().includes(query);
            return matchesEmail || matchesName;
        });
    }, [users, searchQuery]);

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Input
                    placeholder="Buscar por correo o nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Rol Actual</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {searchQuery ? "No se encontraron usuarios" : "No hay usuarios registrados."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image || ""} />
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
                                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                            {user.role === "admin" ? "Administrador" : "Usuario"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <RoleToggleButton
                                                userId={user.id}
                                                currentRole={user.role}
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
        </div>
    );
}

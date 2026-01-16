"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

interface UserSelectorProps {
    users: User[];
    selectedUserIds: string[];
    onSelectionChange: (userIds: string[]) => void;
    placeholder?: string;
}

export function UserSelector({
    users,
    selectedUserIds,
    onSelectionChange,
    placeholder = "Seleccionar usuarios...",
}: UserSelectorProps) {
    const [open, setOpen] = useState(false);

    const selectedUsers = users.filter((user) => selectedUserIds.includes(user.id));

    const toggleUser = (userId: string) => {
        const newSelection = selectedUserIds.includes(userId)
            ? selectedUserIds.filter((id) => id !== userId)
            : [...selectedUserIds, userId];
        onSelectionChange(newSelection);
    };

    const removeUser = (userId: string) => {
        onSelectionChange(selectedUserIds.filter((id) => id !== userId));
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <span className="truncate">
                            {selectedUsers.length > 0
                                ? `${selectedUsers.length} usuario${selectedUsers.length > 1 ? 's' : ''} seleccionado${selectedUsers.length > 1 ? 's' : ''}`
                                : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar usuario..." />
                        <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={`${user.name} ${user.email}`}
                                    onSelect={() => toggleUser(user.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedUserIds.includes(user.id)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected users badges */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                        <Badge
                            key={user.id}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback className="text-[8px]">
                                    {user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{user.name}</span>
                            <button
                                type="button"
                                onClick={() => removeUser(user.id)}
                                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

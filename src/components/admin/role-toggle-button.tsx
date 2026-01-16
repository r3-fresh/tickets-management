"use client";

import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/actions/admin";
import { toast } from "sonner";
import { useTransition } from "react";
import { Shield, User } from "lucide-react";

export function RoleToggleButton({
    userId,
    currentRole,
    disabled
}: {
    userId: string;
    currentRole: string;
    disabled?: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const newRole = currentRole === "admin" ? "user" : "admin";

        startTransition(async () => {
            const result = await updateUserRole(userId, newRole);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(`Rol actualizado a ${newRole === "admin" ? "Administrador" : "Usuario"}`);
            }
        });
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isPending || disabled}
        >
            {currentRole === "admin" ? (
                <>
                    <User className="mr-2 h-4 w-4" />
                    Cambiar a Usuario
                </>
            ) : (
                <>
                    <Shield className="mr-2 h-4 w-4" />
                    Cambiar a Admin
                </>
            )}
        </Button>
    );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleUserActive } from "@/app/actions/admin";
import { toast } from "sonner";
import { Shield, ShieldAlert } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserActiveToggleProps {
    userId: string;
    isActive: boolean;
    disabled?: boolean;
}

export function UserActiveToggle({ userId, isActive, disabled }: UserActiveToggleProps) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const result = await toggleUserActive(userId, !isActive);
            if (result.success) {
                toast.success(isActive ? "Usuario desactivado correctamente" : "Usuario reactivado correctamente");
            } else {
                toast.error(result.error || "Error al cambiar el estado");
            }
        } catch (error) {
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    if (isActive) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled || loading}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Desactivar
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El usuario no podrá iniciar sesión ni acceder al sistema. Puedes reactivarlo en cualquier momento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggle}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={disabled || loading}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
            <Shield className="mr-2 h-4 w-4" />
            {loading ? "Activando..." : "Activar"}
        </Button>
    );
}

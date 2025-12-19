"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignTicketToSelf, updateTicketStatus, unassignTicket, requestValidation } from "@/app/actions/admin";
import { toast } from "sonner";
import { useTransition } from "react";
import { UserPlus, UserMinus, CheckCircle } from "lucide-react";

const STATUS_OPTIONS = [
    { value: "open", label: "Abierto" },
    { value: "in_progress", label: "En Progreso" },
    { value: "pending_validation", label: "Pendiente de Validación" },
    { value: "resolved", label: "Resuelto" },
    { value: "voided", label: "Anulado" },
];

export function AdminTicketControls({
    ticketId,
    currentStatus,
    isAssigned
}: {
    ticketId: number;
    currentStatus: string;
    isAssigned: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (newStatus: string) => {
        startTransition(async () => {
            const result = await updateTicketStatus(ticketId, newStatus as any);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Estado actualizado correctamente");
            }
        });
    };

    const handleAssign = () => {
        startTransition(async () => {
            const result = await assignTicketToSelf(ticketId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Ticket asignado correctamente");
            }
        });
    };

    const handleUnassign = () => {
        startTransition(async () => {
            const result = await unassignTicket(ticketId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Ticket desasignado correctamente");
            }
        });
    };

    const handleRequestValidation = () => {
        startTransition(async () => {
            const result = await requestValidation(ticketId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Validación solicitada al usuario");
            }
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Cambiar Estado
                </label>
                <Select
                    value={currentStatus}
                    onValueChange={handleStatusChange}
                    disabled={isPending}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!isAssigned ? (
                <Button
                    onClick={handleAssign}
                    disabled={isPending}
                    className="w-full"
                    variant="outline"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Asignarme este ticket
                </Button>
            ) : (
                <>
                    <Button
                        onClick={handleUnassign}
                        disabled={isPending}
                        className="w-full"
                        variant="outline"
                    >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Desasignarme este ticket
                    </Button>

                    {currentStatus === 'in_progress' && (
                        <Button
                            onClick={handleRequestValidation}
                            disabled={isPending}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Solicitar Validación
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}

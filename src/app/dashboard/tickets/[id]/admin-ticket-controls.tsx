"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignTicketToSelf, updateTicketStatus, unassignTicket, requestValidation } from "@/actions/admin";
import { toast } from "sonner";
import { useTransition } from "react";
import { UserPlus, UserMinus, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Label } from "@/components/ui/label";

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
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");

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
        setIsValidationDialogOpen(true);
    };

    const submitValidationRequest = () => {
        startTransition(async () => {
            const result = await requestValidation(ticketId, validationMessage);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Validación solicitada al usuario");
                setIsValidationDialogOpen(false);
                setValidationMessage("");
            }
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Cambiar estado
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
                            Solicitar validación
                        </Button>
                    )}
                </>
            )}

            <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Solicitar validación</DialogTitle>
                        <DialogDescription>
                            El usuario recibirá un correo notificando que el ticket ha sido resuelto y requiere su validación.
                            Puedes añadir un mensaje personalizado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="message">Mensaje para el usuario</Label>
                            <RichTextEditor
                                value={validationMessage}
                                onChange={setValidationMessage}
                                placeholder="Escribe un mensaje explicando la solución..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsValidationDialogOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={submitValidationRequest}
                            disabled={isPending}
                        >
                            {isPending ? "Enviando..." : "Enviar solicitud"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

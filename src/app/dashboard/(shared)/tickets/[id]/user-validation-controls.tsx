"use client";

import { Button } from "@/components/ui/button";
import { approveTicketValidation, rejectTicketValidation } from "@/actions/tickets";
import { toast } from "sonner";
import { useTransition } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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

interface UserValidationControlsProps {
    ticketId: number;
}

export function UserValidationControls({ ticketId }: UserValidationControlsProps) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveTicketValidation(ticketId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Ticket validado y cerrado correctamente");
            }
        });
    };

    const handleReject = () => {
        startTransition(async () => {
            const result = await rejectTicketValidation(ticketId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Ticket regresado a 'En progreso' para ajustes");
            }
        });
    };

    return (
        <div className="relative overflow-hidden rounded-xl border border-status-pending-validation/30 bg-status-pending-validation/5">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-pending-validation" />
            
            <div className="px-4 py-3 border-b border-status-pending-validation/10 bg-status-pending-validation/5">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-status-pending-validation-foreground" />
                    <span className="text-xs font-semibold text-status-pending-validation-foreground uppercase tracking-wide">
                        Requiere tu validación
                    </span>
                </div>
            </div>
            
            <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-3">
                    El agente indica que el ticket está resuelto. Revisa y confirma.
                </p>
                
                <div className="flex flex-col gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                className="w-full justify-start h-8 text-xs font-medium"
                                disabled={isPending}
                            >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                Aprobar y cerrar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Aprobar cierre del ticket?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Confirmas que el ticket ha sido atendido satisfactoriamente y puede cerrarse.
                                    Esta acción cambiará el estado del ticket a "Resuelto".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleApprove}>
                                    Sí, aprobar cierre
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                                disabled={isPending}
                            >
                                <XCircle className="mr-2 h-3.5 w-3.5" />
                                Solicitar ajustes
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Rechazar validación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    El ticket regresará al estado "En progreso" para que el agente pueda realizar los ajustes necesarios.
                                    Puedes agregar un comentario explicando qué ajustes se requieren.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleReject} 
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                    Sí, necesita ajustes
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}

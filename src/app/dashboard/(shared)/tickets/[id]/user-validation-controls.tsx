"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveTicketValidation, rejectTicketValidation } from "@/actions/tickets";
import { toast } from "sonner";
import { useTransition } from "react";
import { CheckCircle2, XCircle, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils/cn";

interface UserValidationControlsProps {
    ticketId: number;
}

export function UserValidationControls({ ticketId }: UserValidationControlsProps) {
    const [isPending, startTransition] = useTransition();
    const [isExpanded, setIsExpanded] = useState(true);

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
        <div className="fixed bottom-6 right-6 z-50 max-w-xs">
            <div 
                className={cn(
                    "rounded-xl border shadow-lg transition-all duration-300 overflow-hidden",
                    "bg-card/95 backdrop-blur-sm border-border",
                    isExpanded ? "w-72" : "w-auto"
                )}
            >
                {isExpanded ? (
                    <>
                        <div 
                            className="flex items-center justify-between px-4 py-3 border-b border-border/50 cursor-pointer"
                            onClick={() => setIsExpanded(false)}
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-status-pending-validation animate-pulse" />
                                <span className="text-xs font-semibold text-foreground">
                                    Requiere tu validación
                                </span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="px-4 py-3">
                            <p className="text-xs text-muted-foreground mb-3">
                                El agente indica que el ticket está resuelto. Revisa y confirma.
                            </p>
                            
                            <div className="flex gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="flex-1 h-8 text-xs"
                                            disabled={isPending}
                                        >
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                            Aprobar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Aprobar cierre del ticket?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Confirmas que el ticket ha sido atendido satisfactoriamente y puede cerrarse.
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
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-8 text-xs"
                                            disabled={isPending}
                                        >
                                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                            Ajustes
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Rechazar validación?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                El ticket regresará al estado "En progreso" para que el agente pueda realizar los ajustes necesarios.
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
                    </>
                ) : (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                        <div className="h-2 w-2 rounded-full bg-status-pending-validation animate-pulse" />
                        <span className="text-xs font-medium text-foreground">Validación pendiente</span>
                        <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto" />
                    </button>
                )}
            </div>
        </div>
    );
}

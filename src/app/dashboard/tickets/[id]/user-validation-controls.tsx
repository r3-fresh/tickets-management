"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function UserValidationControls({ ticketId }: { ticketId: number }) {
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
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                    <AlertCircle className="h-5 w-5" />
                    Validación requerida
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                    El agente ha culminado la atención. Por favor revisa y valida si el ticket puede cerrarse.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={isPending}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Aprobar cierre
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
                            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                Sí, aprobar cierre
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex-1 border-orange-300 hover:bg-orange-100"
                            disabled={isPending}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rechazar (necesita ajustes)
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
                            <AlertDialogAction onClick={handleReject} className="bg-orange-600 hover:bg-orange-700">
                                Sí, necesita ajustes
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

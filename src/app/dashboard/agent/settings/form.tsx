"use client";

import { updateAreaConfigAction } from "@/app/actions/agent/update-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    isAcceptingTickets: z.boolean(),
    closedMessage: z.string().optional(),
    closedUntil: z.string().optional(),
});

interface SettingsFormProps {
    initialData: {
        isAcceptingTickets: boolean;
        closedMessage: string | null;
        closedUntil: Date | null;
    };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isAcceptingTickets: initialData.isAcceptingTickets,
            closedMessage: initialData.closedMessage || "",
            closedUntil: initialData.closedUntil ? new Date(initialData.closedUntil).toISOString().slice(0, 16) : "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append("isAcceptingTickets", String(values.isAcceptingTickets));
        if (values.closedMessage) formData.append("closedMessage", values.closedMessage);
        if (values.closedUntil) formData.append("closedUntil", values.closedUntil);

        startTransition(async () => {
            const result = await updateAreaConfigAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Configuración actualizada correctamente");
            }
        });
    }

    const isAccepting = form.watch("isAcceptingTickets");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Recepción de Tickets</CardTitle>
                <CardDescription>
                    Controla si tu área está aceptando nuevos tickets y configura mensajes automáticos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="isAcceptingTickets"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Aceptar Tickets</FormLabel>
                                        <FormDescription>
                                            Desactiva esto para bloquear temporalmente la creación de nuevos tickets para tu área.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {!isAccepting && (
                            <div className="space-y-4 border-l-2 border-amber-200 pl-4 ml-2">
                                <FormField
                                    control={form.control}
                                    name="closedMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mensaje de Cierre</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ej: Estamos realizando mantenimiento. Volveremos pronto."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Este mensaje se mostrará a los usuarios cuando intenten crear un ticket.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="closedUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cerrado Hasta (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Fecha y hora estimada de reapertura.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

"use client";

import { updateAreaConfigAction } from "@/actions/agent/update-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    isAcceptingTickets: z.boolean(),
});

interface SettingsFormProps {
    initialData: {
        isAcceptingTickets: boolean;
    };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isAcceptingTickets: initialData.isAcceptingTickets,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append("isAcceptingTickets", String(values.isAcceptingTickets));

        startTransition(async () => {
            const result = await updateAreaConfigAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Configuración actualizada correctamente");
            }
        });
    }

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

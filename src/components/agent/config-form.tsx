"use client";

import { updateAreaConfigAction } from "@/actions/agent/update-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { toast } from "sonner";

interface SettingsFormProps {
    initialData: {
        isAcceptingTickets: boolean;
    };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition();

    function handleToggleChange(checked: boolean) {
        const formData = new FormData();
        formData.append("isAcceptingTickets", String(checked));

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
                <CardTitle>Recepción de tickets</CardTitle>
                <CardDescription>
                    Controla si tu área está aceptando nuevos tickets.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label className="text-base">Aceptar tickets</Label>
                        <p className="text-sm text-muted-foreground">
                            Desactiva esto para bloquear temporalmente la creación de nuevos tickets para tu área.
                        </p>
                    </div>
                    <Switch
                        checked={initialData.isAcceptingTickets}
                        onCheckedChange={handleToggleChange}
                        disabled={isPending}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useTransition } from "react";
import { updateAppSetting } from "@/app/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface SettingsFormProps {
    initialAllowNewTickets: boolean;
}

export function SettingsForm({ initialAllowNewTickets }: SettingsFormProps) {
    const [allowNewTickets, setAllowNewTickets] = useState(initialAllowNewTickets);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        setAllowNewTickets(checked);
        startTransition(async () => {
            const result = await updateAppSetting("allow_new_tickets", checked ? "true" : "false");
            if (result.error) {
                setAllowNewTickets(!checked); // Revert
                toast.error(result.error);
            } else {
                toast.success("Configuración actualizada");
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Control de Tickets</CardTitle>
                <CardDescription>
                    Gestiona la disponibilidad del sistema de tickets.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="allow-tickets" className="font-medium">
                            Permitir crear nuevos tickets
                        </Label>
                        <span className="text-sm text-muted-foreground">
                            Si se desactiva, los usuarios no podrán crear nuevos tickets.
                            Útil para periodos de vacaciones o mantenimiento.
                        </span>
                    </div>
                    <Switch
                        id="allow-tickets"
                        checked={allowNewTickets}
                        onCheckedChange={handleToggle}
                        disabled={isPending}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

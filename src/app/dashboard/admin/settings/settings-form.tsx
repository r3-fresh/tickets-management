"use client";

import { useState, useTransition } from "react";
import { updateAppSetting } from "@/app/actions/admin";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface SettingsFormProps {
    initialAllowNewTickets: boolean;
    initialDisabledMessage?: string;
}

export function SettingsForm({ initialAllowNewTickets, initialDisabledMessage = "" }: SettingsFormProps) {
    const [allowNewTickets, setAllowNewTickets] = useState(initialAllowNewTickets);
    const [disabledMessage, setDisabledMessage] = useState(initialDisabledMessage);
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
        <div className="space-y-4">
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

            {!allowNewTickets && (
                <div className="space-y-2 pt-2">
                    <Label htmlFor="disabled-message">
                        Mensaje personalizado
                    </Label>
                    <Textarea
                        id="disabled-message"
                        value={disabledMessage}
                        onChange={(e) => setDisabledMessage(e.target.value)}
                        onBlur={() => {
                            if (disabledMessage !== initialDisabledMessage) {
                                startTransition(async () => {
                                    const result = await updateAppSetting("ticket_disabled_message", disabledMessage);
                                    if (result.error) {
                                        toast.error(result.error);
                                    } else {
                                        toast.success("Mensaje actualizado");
                                    }
                                });
                            }
                        }}
                        placeholder="Ej: Sistema en mantenimiento. La creación de tickets estará disponible próximamente."
                        rows={3}
                        disabled={isPending}
                    />
                    <span className="text-xs text-muted-foreground">
                        Este mensaje se mostrará a los usuarios cuando intenten crear un ticket.
                    </span>
                </div>
            )}
        </div>
    );
}

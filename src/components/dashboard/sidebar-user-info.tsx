"use client";

import { useEffect, useState } from "react";
import { getAgentAreaName } from "@/app/actions/agent/get-area-name";
import { Badge } from "@/components/ui/badge";

interface SidebarUserInfoProps {
    role: string;
}

export function SidebarUserInfo({ role }: SidebarUserInfoProps) {
    const [areaName, setAreaName] = useState<string | null>(null);

    useEffect(() => {
        if (role === "agent") {
            getAgentAreaName().then(setAreaName);
        }
    }, [role]);

    const roleLabel = role === "admin" ? "Administrador" : role === "agent" ? "Agente" : "Usuario";

    return (
        <div className="flex flex-col items-center gap-1">
            <Badge variant="outline" className="text-xs font-normal border-muted-foreground/30">
                {roleLabel}
            </Badge>
            {role === "agent" && areaName && (
                <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
                    {areaName}
                </span>
            )}
        </div>
    );
}

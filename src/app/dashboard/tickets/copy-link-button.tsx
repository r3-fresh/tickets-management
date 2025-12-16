"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export function CopyLinkButton({ ticketId }: { ticketId: number }) {
    const handleCopy = () => {
        const url = `${window.location.origin}/dashboard/tickets/${ticketId}`;
        navigator.clipboard.writeText(url);
        toast.success("Enlace copiado al portapapeles");
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            title="Copiar enlace"
        >
            <LinkIcon className="h-4 w-4" />
        </Button>
    );
}

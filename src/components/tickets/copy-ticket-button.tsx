"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CopyTicketButtonProps {
    ticketCode: string;
    title: string;
}

export function CopyTicketButton({ ticketCode, title }: CopyTicketButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const text = `Ticket #${ticketCode} | ${title}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={handleCopy}
            title="Copiar referencia del ticket"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
                <Copy className="h-3.5 w-3.5" />
            )}
        </Button>
    );
}

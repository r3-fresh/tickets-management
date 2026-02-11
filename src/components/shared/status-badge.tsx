import { cn } from "@/lib/utils/cn";
import { STATUS_STYLES } from "@/lib/constants/ticket-display";
import { STATUS_LABELS } from "@/lib/constants/tickets";
import type { TicketStatus } from "@/types";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const styles = STATUS_STYLES[status as TicketStatus];
    const label = STATUS_LABELS[status as TicketStatus] || status;

    if (!styles) {
        return (
            <span className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                "bg-muted text-muted-foreground border-border",
                className,
            )}>
                {label}
            </span>
        );
    }

    return (
        <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            styles.bg,
            styles.text,
            styles.border,
            className,
        )}>
            {label}
        </span>
    );
}

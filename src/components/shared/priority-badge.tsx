import { cn } from "@/lib/utils/cn";
import { PRIORITY_STYLES } from "@/lib/constants/ticket-display";
import { PRIORITY_LABELS } from "@/lib/constants/tickets";
import type { TicketPriority } from "@/types";

interface PriorityBadgeProps {
    priority: string;
    className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const styles = PRIORITY_STYLES[priority as TicketPriority];
    const label = PRIORITY_LABELS[priority as TicketPriority] || priority;

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
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            styles.bg,
            styles.text,
            styles.border,
            className,
        )}>
            {label}
        </span>
    );
}

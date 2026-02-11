import type { TicketStatus, TicketPriority } from "@/types";

// ============================================
// Mapeo de estados a clases de Tailwind (tokens del design system)
// ============================================

export const STATUS_STYLES: Record<TicketStatus, { bg: string; text: string }> = {
    open: {
        bg: "bg-status-open",
        text: "text-status-open-foreground",
    },
    in_progress: {
        bg: "bg-status-in-progress",
        text: "text-status-in-progress-foreground",
    },
    pending_validation: {
        bg: "bg-status-pending-validation",
        text: "text-status-pending-validation-foreground",
    },
    resolved: {
        bg: "bg-status-resolved",
        text: "text-status-resolved-foreground",
    },
    voided: {
        bg: "bg-status-voided",
        text: "text-status-voided-foreground",
    },
};

// ============================================
// Mapeo de prioridades a clases de Tailwind (tokens del design system)
// ============================================

export const PRIORITY_STYLES: Record<TicketPriority, { bg: string; text: string; border: string }> = {
    low: {
        bg: "bg-priority-low",
        text: "text-priority-low-foreground",
        border: "border-priority-low-foreground/20",
    },
    medium: {
        bg: "bg-priority-medium",
        text: "text-priority-medium-foreground",
        border: "border-priority-medium-foreground/25",
    },
    high: {
        bg: "bg-priority-high",
        text: "text-priority-high-foreground",
        border: "border-priority-high-foreground/25",
    },
    critical: {
        bg: "bg-priority-critical",
        text: "text-priority-critical-foreground",
        border: "border-priority-critical-foreground/30",
    },
};

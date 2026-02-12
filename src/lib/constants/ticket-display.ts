import type { TicketStatus, TicketPriority } from "@/types";

// ============================================
// Mapeo de estados a clases de Tailwind (tokens del design system)
// ============================================

export const STATUS_STYLES: Record<TicketStatus, { bg: string; text: string; border: string }> = {
    open: {
        bg: "bg-status-open",
        text: "text-status-open-foreground",
        border: "border-status-open-foreground/20",
    },
    in_progress: {
        bg: "bg-status-in-progress",
        text: "text-status-in-progress-foreground",
        border: "border-status-in-progress-foreground/20",
    },
    pending_validation: {
        bg: "bg-status-pending-validation",
        text: "text-status-pending-validation-foreground",
        border: "border-status-pending-validation-foreground/20",
    },
    resolved: {
        bg: "bg-status-resolved",
        text: "text-status-resolved-foreground",
        border: "border-status-resolved-foreground/20",
    },
    voided: {
        bg: "bg-status-voided",
        text: "text-status-voided-foreground",
        border: "border-status-voided-foreground/20",
    },
};

// ============================================
// Mapeo de prioridades a clases de Tailwind (tokens del design system)
// ============================================

export const PRIORITY_STYLES: Record<TicketPriority, { bg: string; text: string; border: string; hover: string }> = {
    low: {
        bg: "bg-priority-low",
        text: "text-priority-low-foreground",
        border: "border-priority-low-foreground/20",
        hover: "hover:bg-priority-low hover:text-priority-low-foreground/90",
    },
    medium: {
        bg: "bg-priority-medium",
        text: "text-priority-medium-foreground",
        border: "border-priority-medium-foreground/25",
        hover: "hover:bg-priority-medium hover:text-priority-medium-foreground/90",
    },
    high: {
        bg: "bg-priority-high",
        text: "text-priority-high-foreground",
        border: "border-priority-high-foreground/25",
        hover: "hover:bg-priority-high hover:text-priority-high-foreground/90",
    },
    critical: {
        bg: "bg-priority-critical",
        text: "text-priority-critical-foreground",
        border: "border-priority-critical-foreground/30",
        hover: "hover:bg-priority-critical hover:text-priority-critical-foreground/90",
    },
};

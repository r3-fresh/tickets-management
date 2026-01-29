import type { TicketStatus, TicketPriority, ClosedBy } from "@/types";

// ============================================
// Ticket Status Constants
// ============================================

export const TICKET_STATUS: Record<string, TicketStatus> = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    PENDING_VALIDATION: 'pending_validation',
    RESOLVED: 'resolved',
    VOIDED: 'voided',
} as const;

// ============================================
// Ticket Priority Constants
// ============================================

export const TICKET_PRIORITY: Record<string, TicketPriority> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

// ============================================
// Closure Type Constants
// ============================================

export const CLOSURE_TYPE: Record<string, ClosedBy> = {
    USER: 'user',
    ADMIN: 'admin',
    SYSTEM: 'system',
} as const;

// ============================================
// Validation Constants
// ============================================

export const VALIDATION_TIMEOUT_HOURS = 48;

// ============================================
// Status Translations
// ============================================

export const STATUS_LABELS: Record<TicketStatus, string> = {
    open: "Abierto",
    in_progress: "En progreso",
    pending_validation: "Pendiente de validación",
    resolved: "Resuelto",
    voided: "Anulado",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    critical: "Crítica",
};

export const CLOSURE_TYPE_LABELS: Record<ClosedBy, string> = {
    user: "Usuario",
    admin: "Administrador",
    system: "Sistema (48hrs)",
};

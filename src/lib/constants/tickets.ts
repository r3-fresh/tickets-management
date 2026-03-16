import type { TicketStatus, TicketPriority, ClosedBy, ProviderTicketStatus, ProviderTicketPriority, CommentType } from "@/types";

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

// ============================================
// Valid Status Transitions
// ============================================

export const VALID_STATUS_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  open: ['in_progress', 'voided'],
  in_progress: ['open', 'pending_validation', 'resolved', 'voided'],
  pending_validation: ['resolved', 'in_progress'],
  resolved: ['in_progress'],
  voided: [],
};

// ============================================
// Provider Ticket Constants
// ============================================

export const PROVIDER_TICKET_STATUS: Record<string, ProviderTicketStatus> = {
  EN_PROCESO: 'en_proceso',
  CERRADO: 'cerrado',
} as const;

export const PROVIDER_TICKET_STATUS_LABELS: Record<ProviderTicketStatus, string> = {
  en_proceso: "En proceso",
  cerrado: "Cerrado",
};

export const PROVIDER_TICKET_PRIORITY: Record<string, ProviderTicketPriority> = {
  LOW: 'baja',
  MEDIUM: 'media',
  HIGH: 'alta',
  CRITICAL: 'critica',
} as const;

export const PROVIDER_TICKET_PRIORITY_LABELS: Record<ProviderTicketPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

export const PROVIDER_TICKET_PRIORITY_STYLES: Record<ProviderTicketPriority, string> = {
  baja: "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  alta: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critica: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// ============================================
// Comment / Activity Type Constants
// ============================================

export const COMMENT_TYPE: Record<string, CommentType> = {
  COMMENT: 'comment',
  DERIVATION: 'derivation',
  SYSTEM: 'system',
} as const;

export const COMMENT_TYPE_LABELS: Record<CommentType, string> = {
  comment: "Comentario",
  derivation: "Derivación",
  system: "Sistema",
};

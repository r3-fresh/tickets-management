import type { Session as BetterAuthSession, User as BetterAuthUser } from "better-auth/types";

// ============================================
// User & Auth Types
// ============================================

export type UserRole = 'user' | 'admin' | 'agent';

// AppUser extends the BetterAuth User and adds our custom role field
// BetterAuthUser already includes id, name, email, etc.
export interface AppUser extends BetterAuthUser {
  id: string; // Explicitly include id for clarity
  name: string; // Explicitly include name
  email: string; // Explicitly include email
  role: UserRole;
  isActive: boolean; // User activation status
  attentionAreaId?: number; // Optional: Only for agents
}

export interface AppSession extends BetterAuthSession {
  user: AppUser;
}

// ============================================
// Ticket Types
// ============================================

export type TicketStatus = 'open' | 'in_progress' | 'pending_validation' | 'resolved' | 'voided';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type ClosedBy = 'user' | 'admin' | 'system';

export type CommentType = 'comment' | 'derivation' | 'system';

// Metadata types for activity entries
export interface DerivationMetadata {
  providerName: string;
  estimatedDate?: string; // ISO date string (YYYY-MM-DD)
  providerTicketId?: number;
}

// ============================================
// Database Inference Types
// ============================================

import type { tickets, users, comments, ticketAttachments, priorityConfig, providers, providerTickets } from "@/db/schema";

export type Ticket = typeof tickets.$inferSelect;
export type User = typeof users.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type PriorityConfig = typeof priorityConfig.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type ProviderTicket = typeof providerTickets.$inferSelect;

export type NewTicket = typeof tickets.$inferInsert;
export type NewComment = typeof comments.$inferInsert;
export type NewProviderTicket = typeof providerTickets.$inferInsert;

// ============================================
// Provider Ticket Types
// ============================================

export type ProviderTicketStatus = 'en_proceso' | 'cerrado';
export type ProviderTicketPriority = 'baja' | 'media' | 'alta' | 'critica';

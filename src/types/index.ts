import type { Session as BetterAuthSession, User as BetterAuthUser } from "better-auth/types";

// ============================================
// User & Auth Types
// ============================================

export type UserRole = 'user' | 'admin';

// AppUser extends the BetterAuth User and adds our custom role field
// BetterAuthUser already includes id, name, email, etc.
export interface AppUser extends BetterAuthUser {
    id: string; // Explicitly include id for clarity
    name: string; // Explicitly include name
    email: string; // Explicitly include email
    role: UserRole;
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

// ============================================
// Database Inference Types
// ============================================

import type { tickets, users, comments } from "@/db/schema";

export type Ticket = typeof tickets.$inferSelect;
export type User = typeof users.$inferSelect;
export type Comment = typeof comments.$inferSelect;

export type NewTicket = typeof tickets.$inferInsert;
export type NewComment = typeof comments.$inferInsert;

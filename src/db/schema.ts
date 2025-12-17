
import { pgTable, text, timestamp, boolean, uuid, serial, integer, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- AUTH SCHEMA (Better-Auth Compatible) ---

export const users = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    role: text("role").default("user").notNull(), // 'user', 'admin'
});

export const sessions = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id),
});

export const accounts = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

// --- APP SCHEMA ---

export const categories = pgTable("category", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(), // e.g., "Sistema de Gestión Bibliotecaria"
    subcategories: text("subcategories").array(), // Simple array of strings for subcategories
    isActive: boolean("is_active").default(true),
});

export const tickets = pgTable("ticket", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").default("open").notNull(), // open, in_progress, resolved, voided
    priority: text("priority").default("medium").notNull(), // low, medium, high, critical

    categoryId: integer("category_id").references(() => categories.id),
    subcategory: text("subcategory"), // Selected subcategory

    createdById: text("created_by_id").notNull().references(() => users.id),
    assignedToId: text("assigned_to_id").references(() => users.id),

    ccEmails: text("cc_emails").array(), // Deprecated, use watchers instead
    watchers: text("watchers").array(), // User IDs que monitorean el ticket

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comment", {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    ticketId: integer("ticket_id").notNull().references(() => tickets.id),
    userId: text("user_id").notNull().references(() => users.id),
    isInternal: boolean("is_internal").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track when users last viewed tickets (for unread comments)
export const ticketViews = pgTable("ticket_view", {
    id: serial("id").primaryKey(),
    ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
}, (table) => ({
    // Unique constraint: one view record per user per ticket
    uniqueUserTicket: unique().on(table.userId, table.ticketId),
}));

export const attachments = pgTable("attachment", {
    id: uuid("id").primaryKey().defaultRandom(),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    ticketId: integer("ticket_id").notNull().references(() => tickets.id),
    uploadedById: text("uploaded_by_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONS ---

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [tickets.createdById],
        references: [users.id],
        relationName: "createdTickets",
    }),
    assignedTo: one(users, {
        fields: [tickets.assignedToId],
        references: [users.id],
        relationName: "assignedTickets",
    }),
    category: one(categories, {
        fields: [tickets.categoryId],
        references: [categories.id],
    }),
    comments: many(comments),
    attachments: many(attachments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    ticket: one(tickets, {
        fields: [comments.ticketId],
        references: [tickets.id],
    }),
    author: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    createdTickets: many(tickets, { relationName: "createdTickets" }),
    assignedTickets: many(tickets, { relationName: "assignedTickets" }),
    comments: many(comments),
}));

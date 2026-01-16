import { sendGmailEmail, EmailRecipient, getThreadMessageIds } from './gmail-client';
import { getTicketCreatedTemplate } from './templates/ticket-created';
import { getUserCommentTemplate } from './templates/user-comment';
import { getValidationRequestTemplate } from './templates/validation-request';
import { getTicketAssignedTemplate } from './templates/ticket-assigned';
import { getTicketResolvedTemplate } from './templates/ticket-resolved';
import { getTicketRejectedTemplate } from './templates/ticket-rejected';
import { translatePriority, translateStatus } from '../utils/format';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// --- Shared Types ---

interface TicketContext {
    ticketId: number;
    ticketCode: string;
    title: string;
    creatorEmail: string;
    creatorName: string;
    agentEmails: string[];
    watcherEmails: string[];
    attentionAreaName: string;
    // Threading
    emailThreadId?: string | null; // Gmail Thread ID
    initialMessageId?: string | null; // RFC Message-ID of the first email (Root)
}

/**
 * Helper to construct standard unified recipients:
 * TO: Creator
 * CC: Agents + Watchers
 */
function getUnifiedRecipients(ctx: TicketContext): { to: EmailRecipient[], cc: EmailRecipient[] } {
    const to: EmailRecipient[] = [
        { email: ctx.creatorEmail, name: ctx.creatorName }
    ];

    const ccEmails = new Set([...ctx.agentEmails, ...ctx.watcherEmails]);
    // Remove creator from CC if present (unlikely but safe)
    ccEmails.delete(ctx.creatorEmail);

    const cc: EmailRecipient[] = Array.from(ccEmails).map(email => ({ email }));

    return { to, cc };
}

// ============================================================================
// 1. NUEVO TICKET CREADO
// ============================================================================

export interface SendTicketCreatedEmailParams extends TicketContext {
    description: string;
    priority: string;
    categoryName: string;
    subcategoryName: string;
    createdAt: Date;
}

export async function sendTicketCreatedEmail(params: SendTicketCreatedEmailParams) {
    const ticketUrl = `${BASE_URL}/dashboard/tickets/${params.ticketId}`;
    const priorityLabel = translatePriority(params.priority);

    const htmlContent = getTicketCreatedTemplate({
        userName: params.creatorName,
        ticketCode: params.ticketCode,
        category: params.categoryName,
        subcategory: params.subcategoryName,
        title: params.title,
        description: params.description,
        priority: priorityLabel,
        createdAt: params.createdAt.toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        ticketUrl,
        attentionAreaName: params.attentionAreaName,
    });

    const { to, cc } = getUnifiedRecipients(params);

    const result = await sendGmailEmail({
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: `Ticket #${params.ticketCode} | ${params.title}`,
        htmlContent,
        senderName: params.attentionAreaName,
        customMessageId: params.initialMessageId || undefined,
    });

    return result;
}

// ============================================================================
// 2. COMENTARIO DE USUARIO / AGENTE
// ============================================================================

export interface SendUserCommentEmailParams extends TicketContext {
    status: string;
    priority: string;
    categoryName: string;
    subcategoryName: string;
    comment: string;
    userEmail: string; // Quien comentó (para mostrar en template)
    userName: string;
}

export async function sendUserCommentEmail(params: SendUserCommentEmailParams) {
    const ticketUrl = `${BASE_URL}/dashboard/tickets/${params.ticketId}`;
    const statusLabel = translateStatus(params.status);
    const priorityLabel = translatePriority(params.priority);

    const htmlContent = getUserCommentTemplate({
        ticketCode: params.ticketCode,
        title: params.title,
        userName: params.userName,
        userEmail: params.userEmail,
        comment: params.comment,
        category: params.categoryName,
        subcategory: params.subcategoryName,
        status: statusLabel,
        priority: priorityLabel,
        ticketUrl,
        attentionAreaName: params.attentionAreaName,
    });

    const { to, cc } = getUnifiedRecipients(params);

    // Threading Logic: Prefer stored Root ID
    let threadingHeaders: { inReplyTo?: string, references?: string } = {};

    if (params.initialMessageId) {
        threadingHeaders = {
            inReplyTo: params.initialMessageId,
            references: params.initialMessageId
        };
    } else if (params.emailThreadId) {
        // Fallback: Try to fetch from API
        threadingHeaders = await getThreadMessageIds(params.emailThreadId);
    }

    return await sendGmailEmail({
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: `Ticket #${params.ticketCode} | ${params.title}`,
        htmlContent,
        senderName: params.attentionAreaName,
        // Threading
        threadId: params.emailThreadId || undefined,
        ...threadingHeaders
    });
}

// ============================================================================
// 3. SOLICITUD DE VALIDACIÓN
// ============================================================================

export interface SendValidationRequestEmailParams extends TicketContext {
    categoryName: string;
    subcategoryName: string;
}

export async function sendValidationRequestEmail(params: SendValidationRequestEmailParams) {
    const ticketUrl = `${BASE_URL}/dashboard/tickets/${params.ticketId}`;

    const htmlContent = getValidationRequestTemplate({
        userName: params.creatorName,
        ticketCode: params.ticketCode,
        title: params.title,
        category: params.categoryName,
        subcategory: params.subcategoryName,
        ticketUrl,
        attentionAreaName: params.attentionAreaName,
    });

    const { to, cc } = getUnifiedRecipients(params);

    // Threading Logic: Prefer stored Root ID
    let threadingHeaders: { inReplyTo?: string, references?: string } = {};

    if (params.initialMessageId) {
        threadingHeaders = {
            inReplyTo: params.initialMessageId,
            references: params.initialMessageId
        };
    } else if (params.emailThreadId) {
        threadingHeaders = await getThreadMessageIds(params.emailThreadId);
    }

    return await sendGmailEmail({
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: `Ticket #${params.ticketCode} | ${params.title}`, // Unified subject for threading
        htmlContent,
        senderName: params.attentionAreaName,
        // Threading
        threadId: params.emailThreadId || undefined,
        ...threadingHeaders
    });
}

// ============================================================================
// 4. NUEVAS NOTIFICACIONES (Asignación, Resolución, Rechazo)
// ============================================================================

// 4.1 Ticket Asignado
export interface SendTicketAssignedEmailParams extends TicketContext {
    categoryName: string;
    subcategoryName: string;
    agentName: string;
}

export async function sendTicketAssignedEmail(params: SendTicketAssignedEmailParams) {
    const ticketUrl = `${BASE_URL}/dashboard/tickets/${params.ticketId}`;

    const htmlContent = getTicketAssignedTemplate({
        userName: params.creatorName,
        ticketCode: params.ticketCode,
        title: params.title,
        category: params.categoryName,
        subcategory: params.subcategoryName,
        agentName: params.agentName,
        ticketUrl,
        attentionAreaName: params.attentionAreaName,
    });

    const { to, cc } = getUnifiedRecipients(params);

    // Threading Logic
    let threadingHeaders: { inReplyTo?: string, references?: string } = {};
    if (params.initialMessageId) {
        threadingHeaders = { inReplyTo: params.initialMessageId, references: params.initialMessageId };
    } else if (params.emailThreadId) {
        threadingHeaders = await getThreadMessageIds(params.emailThreadId);
    }

    return await sendGmailEmail({
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: `Ticket #${params.ticketCode} | ${params.title}`, // Unified subject for threading
        htmlContent,
        senderName: params.attentionAreaName,
        threadId: params.emailThreadId || undefined,
        ...threadingHeaders
    });
}

// 4.2 Ticket Resuelto
export interface SendTicketResolvedEmailParams extends TicketContext {
    categoryName: string;
    subcategoryName: string;
}

export async function sendTicketResolvedEmail(params: SendTicketResolvedEmailParams) {
    const ticketUrl = `${BASE_URL}/dashboard/tickets/${params.ticketId}`;

    const htmlContent = getTicketResolvedTemplate({
        userName: params.creatorName,
        ticketCode: params.ticketCode,
        title: params.title,
        category: params.categoryName,
        subcategory: params.subcategoryName,
        ticketUrl,
        attentionAreaName: params.attentionAreaName,
    });

    const { to, cc } = getUnifiedRecipients(params);

    // Threading Logic
    let threadingHeaders: { inReplyTo?: string, references?: string } = {};
    if (params.initialMessageId) {
        threadingHeaders = { inReplyTo: params.initialMessageId, references: params.initialMessageId };
    } else if (params.emailThreadId) {
        threadingHeaders = await getThreadMessageIds(params.emailThreadId);
    }

    return await sendGmailEmail({
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: `Ticket #${params.ticketCode} | ${params.title}`, // Unified subject for threading
        htmlContent,
        senderName: params.attentionAreaName,
        threadId: params.emailThreadId || undefined,
        ...threadingHeaders
    });
}

// 4.3 Validación Rechazada
export interface SendTicketRejectedEmailParams extends TicketContext {
    categoryName: string;
    subcategoryName: string;
}

export async function sendTicketRejectedEmail(params: SendTicketRejectedEmailParams) {
    const ticketUrl = `${BASE_URL}/dashboard/tickets/${params.ticketId}`;

    const htmlContent = getTicketRejectedTemplate({
        userName: params.creatorName,
        ticketCode: params.ticketCode,
        title: params.title,
        category: params.categoryName,
        subcategory: params.subcategoryName,
        ticketUrl,
        attentionAreaName: params.attentionAreaName,
    });

    const { to, cc } = getUnifiedRecipients(params);

    // Threading Logic
    let threadingHeaders: { inReplyTo?: string, references?: string } = {};
    if (params.initialMessageId) {
        threadingHeaders = { inReplyTo: params.initialMessageId, references: params.initialMessageId };
    } else if (params.emailThreadId) {
        threadingHeaders = await getThreadMessageIds(params.emailThreadId);
    }

    return await sendGmailEmail({
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: `Ticket #${params.ticketCode} | ${params.title}`, // Unified subject for threading
        htmlContent,
        senderName: params.attentionAreaName,
        threadId: params.emailThreadId || undefined,
        ...threadingHeaders
    });
}

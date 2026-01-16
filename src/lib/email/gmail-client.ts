import { google } from 'googleapis';

export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface SendEmailParams {
    to: EmailRecipient[];
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    subject: string;
    htmlContent: string;
    senderName?: string;
    // Threading
    threadId?: string; // Gmail native Thread ID
    inReplyTo?: string;
    references?: string;
    customMessageId?: string; // Force a specific Message-ID (for thread root)
}

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
);

// Set refresh token from environment
if (process.env.GMAIL_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
}

// Initialize Gmail API
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Encode string to RFC 2047 format if it contains non-ASCII characters
function encodeHeader(name: string): string {
    if (/^[\x00-\x7F]*$/.test(name)) return name;
    return `=?UTF-8?B?${Buffer.from(name).toString('base64')}?=`;
}

/**
 * Creates a raw email message string compliant with RFC 2822
 */
function createEmailMessage(params: SendEmailParams): string {
    const { to, cc, bcc, subject, htmlContent, senderName, inReplyTo, references } = params;

    // We will keep the header generation logic, but in usage we will prioritize threadId

    const boundary = "000000000000000000000000000";
    const emailLines: string[] = [];

    // Headers
    // From
    const fromName = encodeHeader(senderName || "Soporte TI");
    emailLines.push(`From: "${fromName}" <${process.env.EMAIL_FROM}>`);

    // Force Custom Message-ID if provided (Critical for threading)
    if (params.customMessageId) {
        emailLines.push(`Message-ID: ${params.customMessageId}`);
    }

    // To
    emailLines.push(`To: ${to.map(r => r.name ? `"${encodeHeader(r.name)}" <${r.email}>` : r.email).join(', ')}`);

    // CC
    if (cc && cc.length > 0) {
        emailLines.push(`Cc: ${cc.map(r => r.name ? `"${encodeHeader(r.name)}" <${r.email}>` : r.email).join(', ')}`);
    }

    // BCC
    if (bcc && bcc.length > 0) {
        emailLines.push(`Bcc: ${bcc.map(r => r.name ? `"${encodeHeader(r.name)}" <${r.email}>` : r.email).join(', ')}`);
    }

    // Threading Headers (Only add if valid values provided)
    if (inReplyTo) {
        emailLines.push(`In-Reply-To: ${inReplyTo}`);
    }
    if (references) {
        emailLines.push(`References: ${references}`);
    }

    // Subject
    // Always encode subject to ensure consistent behavior and avoid charset issues
    emailLines.push(`Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`);

    // MIME
    emailLines.push("MIME-Version: 1.0");
    emailLines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    emailLines.push("");

    // HTML Body
    emailLines.push(`--${boundary}`);
    emailLines.push("Content-Type: text/html; charset=UTF-8");
    emailLines.push("Content-Transfer-Encoding: quoted-printable");
    emailLines.push("");
    emailLines.push(quotedPrintableEncode(htmlContent));
    emailLines.push("");

    emailLines.push(`--${boundary}--`);

    return emailLines.join("\r\n");
}

function quotedPrintableEncode(str: string): string {
    return str.replace(/[=\x80-\xFF]/g, (c) => '=' + c.charCodeAt(0).toString(16).toUpperCase())
        .replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'); // Normalize line endings
}


/**
 * Fetch thread details to get references for threading
 * Includes retry logic to handle API consistency delays
 */
export async function getThreadMessageIds(threadId: string): Promise<{ inReplyTo?: string, references?: string }> {
    console.log(`🔍 [Threading] Fetching details for Thread ID: ${threadId}`);

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
        try {
            const thread = await gmail.users.threads.get({
                userId: 'me',
                id: threadId,
                format: 'metadata',
                metadataHeaders: ['Message-ID', 'Message-Id', 'message-id'], // Request variations just in case
            });

            if (!thread.data.messages || thread.data.messages.length === 0) {
                console.warn(`⚠️ [Threading] Thread ${threadId} found but has no messages. Attempt ${attempt + 1}/${maxAttempts}`);
                attempt++;
                if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 1000)); // Wait 1s
                continue;
            }

            const messages = thread.data.messages;
            const messageIds: string[] = [];

            messages.forEach(msg => {
                // Case-insensitive header lookup
                const header = msg.payload?.headers?.find(h => h.name && h.name.toLowerCase() === 'message-id');
                if (header?.value) {
                    messageIds.push(header.value);
                }
            });

            console.log(`🔍 [Threading] Found ${messageIds.length} Message-IDs in thread ${threadId}:`, messageIds);

            if (messageIds.length === 0) {
                // Thread exists but no IDs found? Weird.
                console.warn(`⚠️ [Threading] Messages found but no Message-ID header. Attempt ${attempt + 1}/${maxAttempts}`);
                attempt++;
                if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            // In-Reply-To should be the Message-ID of the last email in the thread
            const inReplyTo = messageIds[messageIds.length - 1];

            // References should include all previous Message-IDs
            const references = messageIds.join(' ');

            console.log(`✅ [Threading] Calculated Headers for ${threadId}:`, { inReplyTo, references });

            return { inReplyTo, references };

        } catch (error) {
            console.error(`❌ [Threading] Failed to fetch thread details (Attempt ${attempt + 1}):`, error);
            attempt++;
            if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 1000));
        }
    }

    console.error(`❌ [Threading] Gave up fetching thread details after ${maxAttempts} attempts.`);
    return {};
}

/**
 * Send email using Gmail API
 */
export async function sendGmailEmail(params: SendEmailParams) {
    if (!process.env.GMAIL_REFRESH_TOKEN) {
        console.warn("⚠️ GMAIL_REFRESH_TOKEN is missing. Email not sent:", {
            to: params.to.map(r => r.email),
            subject: params.subject
        });
        return { success: false, error: "Missing GMAIL_REFRESH_TOKEN" };
    }

    try {
        const rawMessage = createEmailMessage(params);
        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const requestBody: any = {
            raw: encodedMessage,
        };

        // KEY FIX: Pass threadId to API effectively grouping the email in Gmail
        if (params.threadId) {
            requestBody.threadId = params.threadId;
        }

        console.log('📤 Sending email...', {
            to: params.to.map(r => r.email),
            subject: params.subject,
            threadId: params.threadId,
            inReplyTo: params.inReplyTo,
            references: params.references ? 'CHECKED' : 'MISSING'
        });

        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody,
        });

        // Fetch the ACTUAL Message-ID assigned by Gmail/Google
        // This is critical because Gmail may ignore our custom Message-ID header
        let rfcMessageId: string | undefined;

        try {
            const sentMessage = await gmail.users.messages.get({
                userId: 'me',
                id: result.data.id!,
                format: 'metadata',
                metadataHeaders: ['Message-ID'],
            });

            const header = sentMessage.data.payload?.headers?.find(
                h => h.name && h.name.toLowerCase() === 'message-id'
            );

            if (header?.value) {
                rfcMessageId = header.value;
            }
        } catch (fetchError) {
            console.warn('⚠️ Could not fetch sent message details to get Message-ID:', fetchError);
        }

        console.log('✅ Email sent via Gmail API:', {
            to: params.to.map(r => r.email),
            subject: params.subject,
            messageId: result.data.id,
            rfcMessageId: rfcMessageId, // The true ID
            threadId: result.data.threadId
        });

        return { success: true, data: { ...result.data, rfcMessageId } };
    } catch (error) {
        console.error('❌ Error sending email via Gmail API:', error);
        return { success: false, error };
    }
}

import { sendEmail } from './email';
import { translatePriority } from './utils/format';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const MAIN_EMAIL = 'cendoc@continental.edu.pe'; // Verified email in Resend

interface SendTicketCreatedEmailParams {
    ticketCode: string;
    title: string;
    description: string;
    priority: string;
    createdBy: string;
    createdByEmail: string;
    ticketId: number;
    watcherEmails: string[];     // All watchers
    adminEmails: string[];       // All admins
}

export async function sendTicketCreatedEmail(params: SendTicketCreatedEmailParams) {
    const {
        ticketCode,
        title,
        description,
        priority,
        createdBy,
        createdByEmail,
        ticketId,
        watcherEmails,
        adminEmails
    } = params;

    const ticketUrl = `${BASE_URL}/dashboard/tickets/${ticketId}`;
    const priorityLabel = translatePriority(priority);

    // Build stakeholder list for email body
    const allStakeholders = [
        { email: createdByEmail, role: 'Creador' },
        ...watcherEmails.map(email => ({ email, role: 'Observador' })),
        ...adminEmails.map(email => ({ email, role: 'Administrador' }))
    ];

    // Remove duplicates
    const uniqueStakeholders = allStakeholders.filter((item, index, self) =>
        index === self.findIndex(t => t.email === item.email)
    );

    const stakeholdersList = uniqueStakeholders.map(s =>
        `<li><strong>${s.role}:</strong> ${s.email}</li>`
    ).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .ticket-info { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .stakeholders { background-color: #EEF2FF; padding: 12px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #4F46E5; }
        .stakeholders ul { margin: 5px 0; padding-left: 20px; }
        .label { font-weight: bold; color: #6B7280; }
        .button { 
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
        .priority { 
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .priority-alta, .priority-crítica { background-color: #FEE2E2; color: #991B1B; }
        .priority-media { background-color: #FEF3C7; color: #92400E; }
        .priority-baja { background-color: #DBEAFE; color: #1E40AF; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">✅ Nuevo Ticket Creado</h1>
        </div>
        <div class="content">
            <p>Se ha creado un nuevo ticket en el sistema.</p>
            
            <div class="ticket-info">
                <p><span class="label">Código:</span> ${ticketCode}</p>
                <p><span class="label">Título:</span> ${title}</p>
                <p><span class="label">Creado por:</span> ${createdBy}</p>
                <p><span class="label">Prioridad:</span> <span class="priority priority-${priorityLabel.toLowerCase()}">${priorityLabel}</span></p>
                <p><span class="label">Descripción:</span></p>
                <div style="padding: 10px; background-color: #f3f4f6; border-radius: 4px; margin-top: 5px;">
                    ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}
                </div>
            </div>

            <div class="stakeholders">
                <p style="margin: 0 0 8px 0;"><strong>📧 Personas involucradas:</strong></p>
                <ul style="margin: 5px 0;">
                    ${stakeholdersList}
                </ul>
            </div>

            <a href="${ticketUrl}" class="button">Ver Detalle del Ticket</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
                Este es un correo automático del sistema de tickets. Por favor reenvía este mensaje a las personas involucradas.
            </p>
        </div>
    </div>
</body>
</html>`;

    return await sendEmail({
        to: MAIN_EMAIL,  // Only send to verified email
        subject: `Nuevo Ticket: ${ticketCode} - ${title}`,
        html
    });
}

interface SendValidationRequestEmailParams {
    ticketCode: string;
    title: string;
    createdByEmail: string;
    createdByName: string;
    ticketId: number;
    watcherEmails: string[];
    adminEmails: string[];
}

export async function sendValidationRequestEmail(params: SendValidationRequestEmailParams) {
    const { ticketCode, title, createdByEmail, createdByName, ticketId, watcherEmails, adminEmails } = params;
    const ticketUrl = `${BASE_URL}/dashboard/tickets/${ticketId}`;

    // Build stakeholder list for email body
    const allStakeholders = [
        { email: createdByEmail, role: 'Solicitante' },
        ...watcherEmails.map(email => ({ email, role: 'Observador' })),
        ...adminEmails.map(email => ({ email, role: 'Administrador' }))
    ];

    // Remove duplicates
    const uniqueStakeholders = allStakeholders.filter((item, index, self) =>
        index === self.findIndex(t => t.email === item.email)
    );

    const stakeholdersList = uniqueStakeholders.map(s =>
        `<li><strong>${s.role}:</strong> ${s.email}</li>`
    ).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #F59E0B; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .ticket-info { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .stakeholders { background-color: #FEF3C7; padding: 12px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #F59E0B; }
        .stakeholders ul { margin: 5px 0; padding-left: 20px; }
        .label { font-weight: bold; color: #6B7280; }
        .button { 
            display: inline-block;
            background-color: #10B981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
        .alert { 
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">⏳ Validación de Ticket Requerida</h1>
        </div>
        <div class="content">
            <p>El agente encargado ha culminado la atención del ticket <strong>${ticketCode}</strong> y requiere validación del solicitante <strong>${createdByName}</strong>.</p>
            
            <div class="ticket-info">
                <p><span class="label">Código:</span> ${ticketCode}</p>
                <p><span class="label">Título:</span> ${title}</p>
                <p><span class="label">Solicitante:</span> ${createdByName} (${createdByEmail})</p>
            </div>

            <div class="stakeholders">
                <p style="margin: 0 0 8px 0;"><strong>📧 Personas involucradas:</strong></p>
                <ul style="margin: 5px 0;">
                    ${stakeholdersList}
                </ul>
            </div>

            <div class="alert">
                <strong>⚠️ Acción Requerida:</strong> El solicitante debe revisar el ticket y validar si la atención fue satisfactoria.
                <br><br>
                Si no se valida en 48 horas, el ticket se cerrará automáticamente.
            </div>

            <a href="${ticketUrl}" class="button">Revisar y Validar Ticket</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
                El solicitante puede aprobar el cierre o rechazarlo si necesita ajustes adicionales. Por favor reenvía este mensaje a las personas involucradas.
            </p>
        </div>
    </div>
</body>
</html>`;

    return await sendEmail({
        to: MAIN_EMAIL,  // Only send to verified email
        subject: `Validación Requerida: ${ticketCode} - ${title}`,
        html
    });
}

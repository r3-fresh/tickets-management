import { getBaseTemplate } from './base-template';

export interface TicketRejectedTemplateParams {
    userName: string;
    ticketCode: string;
    title: string;
    category: string;
    subcategory: string;
    ticketUrl: string;
    attentionAreaName?: string;
}

export function getTicketRejectedTemplate(params: TicketRejectedTemplateParams): string {
    const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Validación Rechazada</h2>
        
        <p style="margin: 15px 0;">Hola <strong>${params.userName}</strong>,</p>
        
        <p style="margin: 15px 0;">Has rechazado la solución propuesta para el ticket <strong>#${params.ticketCode}</strong>.</p>
        
        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991B1B;">
                El ticket se ha reabierto automáticamente y ha regresado al estado "En Progreso".
            </p>
        </div>

        <p style="margin: 15px 0;">Un agente revisará tus comentarios y continuará con la atención.</p>

        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ir al Ticket</a>
        </div>
    `;

    return getBaseTemplate(content, params.attentionAreaName);
}

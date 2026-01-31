import { getBaseTemplate } from './base-template';

export interface TicketAssignedTemplateParams {
    userName: string;
    ticketCode: string;
    title: string;
    category: string;
    subcategory: string;
    agentName: string;
    ticketUrl: string;
    attentionAreaName?: string;
}

export function getTicketAssignedTemplate(params: TicketAssignedTemplateParams): string {
    const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Ticket asignado</h2>
        
        <p style="margin: 15px 0;">Hola <strong>${params.userName}</strong>,</p>
        
        <p style="margin: 15px 0;">Te informamos que tu ticket <strong>#${params.ticketCode}</strong> ha sido asignado a un agente de soporte y está en proceso de atención.</p>
        
        <div style="background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1E40AF; font-weight: 500;">Tu solicitud está siendo atendida por nuestro equipo de soporte especializado.</p>
        </div>

        <div style="background-color: #F9FAFB; padding: 15px; margin: 20px 0;">
            <strong>Detalles:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;"><strong>Título:</strong> ${params.title}</li>
                <li style="margin: 8px 0;"><strong>Categoría:</strong> ${params.category}</li>
                <li style="margin: 8px 0;"><strong>Subcategoría:</strong> ${params.subcategory}</li>
            </ul>
        </div>
        
        <p style="margin: 15px 0;">Estamos trabajando en tu solicitud y te contactaremos pronto si necesitamos más información. Puedes dar seguimiento en el siguiente botón:</p>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver detalles del ticket</a>
        </div>
    `;

    return getBaseTemplate(content, params.attentionAreaName);
}

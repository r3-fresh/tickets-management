import { getBaseTemplate } from './base-template';

export interface TicketResolvedTemplateParams {
    userName: string;
    ticketCode: string;
    title: string;
    category: string;
    subcategory: string;
    ticketUrl: string;
    attentionAreaName?: string;
}

export function getTicketResolvedTemplate(params: TicketResolvedTemplateParams): string {
    const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Ticket resuelto</h2>
        
        <p style="margin: 15px 0;">Hola <strong>${params.userName}</strong>,</p>
        
        <p style="margin: 15px 0;">Nos alegra informarte que tu ticket <strong>#${params.ticketCode}</strong> ha sido marcado como <strong>RESUELTO</strong> y cerrado tras tu validación.</p>
        
        <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065F46;">
                ¡Gracias por confirmar la solución!
            </p>
        </div>

        <div style="background-color: #F9FAFB; padding: 15px; margin: 20px 0;">
            <strong>Resumen:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;"><strong>Título:</strong> ${params.title}</li>
                <li style="margin: 8px 0;"><strong>Categoría:</strong> ${params.category}</li>
                <li style="margin: 8px 0;"><strong>Subcategoría:</strong> ${params.subcategory}</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver detalles del ticket</a>
        </div>
    `;

    return getBaseTemplate(content, params.attentionAreaName);
}

import { getBaseTemplate } from './base-template';
import { escapeHtml } from '../escape-html';

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
    const userName = escapeHtml(params.userName);
    const ticketCode = escapeHtml(params.ticketCode);
    const title = escapeHtml(params.title);
    const category = escapeHtml(params.category);
    const subcategory = escapeHtml(params.subcategory);

    const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Ticket resuelto</h2>
        
        <p style="margin: 15px 0;">Hola <strong>${userName}</strong>,</p>
        
        <p style="margin: 15px 0;">Nos alegra informarte que tu ticket <strong>#${ticketCode}</strong> ha sido marcado como <strong>RESUELTO</strong> y cerrado tras tu validación.</p>
        
        <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065F46;">
                ¡Gracias por confirmar la solución!
            </p>
        </div>


        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver detalles del ticket</a>
        </div>
    `;

    return getBaseTemplate(content, params.attentionAreaName);
}

import { getBaseTemplate } from './base-template';
import { escapeHtml } from '../escape-html';

export interface TicketCreatedTemplateParams {
    userName: string;
    ticketCode: string;
    category: string;
    subcategory: string;
    title: string;
    description: string;
    priority: string;
    createdAt: string;
    ticketUrl: string;
    attentionAreaName?: string;
}

export function getTicketCreatedTemplate(params: TicketCreatedTemplateParams): string {
    const userName = escapeHtml(params.userName);
    const ticketCode = escapeHtml(params.ticketCode);
    const category = escapeHtml(params.category);
    const subcategory = escapeHtml(params.subcategory);
    const title = escapeHtml(params.title);
    const description = escapeHtml(params.description);
    const priority = escapeHtml(params.priority);
    const createdAt = escapeHtml(params.createdAt);

    const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Nueva solicitud de atención</h2>
        
        <p style="margin: 15px 0;">Estimado <strong>${userName}</strong>:</p>
        
        <p style="margin: 15px 0;">Gracias por registrar tu requerimiento a través de nuestro formulario. 
        En breve estaremos atendiendo tu pedido, el cual detallamos a continuación.</p>
        
        <div style="background-color: #F9FAFB; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0;">
            <strong>Detalles del requerimiento:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;"><strong>Código:</strong> ${ticketCode}</li>
                <li style="margin: 8px 0;"><strong>Categoría:</strong> ${category}</li>
                <li style="margin: 8px 0;"><strong>Subcategoría:</strong> ${subcategory}</li>
                <li style="margin: 8px 0;"><strong>Título:</strong> ${title}</li>
                <li style="margin: 8px 0;"><strong>Prioridad:</strong> ${priority}</li>
                <li style="margin: 8px 0;">
                    <strong>Descripción:</strong> 
                    <div style="white-space: pre-wrap; word-break: break-word; margin-top: 5px;">${description}</div>
                </li>
                <li style="margin: 8px 0;"><strong>Fecha de solicitud:</strong> ${createdAt}</li>
            </ul>
        </div>
        
        <p style="margin: 15px 0;">Recuerda que puedes dar seguimiento a tu requerimiento a través del siguiente botón:</p>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver detalles del ticket</a>
        </div>
    `;

    return getBaseTemplate(content, params.attentionAreaName);
}

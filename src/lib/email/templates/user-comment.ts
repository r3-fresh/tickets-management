import { getBaseTemplate } from './base-template';

export interface UserCommentTemplateParams {
    ticketCode: string;
    title: string;
    userName: string;
    userEmail: string;
    comment: string;
    category: string;
    subcategory: string;
    status: string;
    priority: string;
    ticketUrl: string;
    attentionAreaName?: string;
}

export function getUserCommentTemplate(params: UserCommentTemplateParams): string {
    const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Nuevo comentario en Ticket #${params.ticketCode}</h2>
        
        <p style="margin: 15px 0;">El usuario <strong>${params.userName}</strong> (${params.userEmail}) ha añadido un comentario al ticket:</p>
        
        <div style="background-color: #F9FAFB; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #4B5563; white-space: pre-wrap;">
                ${params.comment}
            </p>
        </div>
        
        <div style="background-color: #F9FAFB; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0;">
            <strong>Detalles del ticket:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;"><strong>Código:</strong> ${params.ticketCode}</li>
                <li style="margin: 8px 0;"><strong>Título:</strong> ${params.title}</li>
                <li style="margin: 8px 0;"><strong>Categoría:</strong> ${params.category}</li>
                <li style="margin: 8px 0;"><strong>Subcategoría:</strong> ${params.subcategory}</li>
                <li style="margin: 8px 0;"><strong>Estado:</strong> ${params.status}</li>
                <li style="margin: 8px 0;"><strong>Prioridad:</strong> ${params.priority}</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver Ticket Completo</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 13px; color: #6B7280; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            Este correo es enviado solo a los agentes encargados de esta categoría.
        </p>
    `;

    return getBaseTemplate(content, params.attentionAreaName);
}

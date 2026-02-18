import { getBaseTemplate } from './base-template';
import { escapeHtml } from '../escape-html';

export interface ValidationRequestTemplateParams {
    userName: string;
    ticketCode: string;
    title: string;
    category: string;
    subcategory: string;
    ticketUrl: string;
    attentionAreaName?: string;
    message?: string;
}

export function getValidationRequestTemplate(params: ValidationRequestTemplateParams): string {
    const userName = escapeHtml(params.userName);
    const ticketCode = escapeHtml(params.ticketCode);
    const title = escapeHtml(params.title);
    const category = escapeHtml(params.category);
    const subcategory = escapeHtml(params.subcategory);
    // message es HTML de TipTap (rich text), no se escapa
    const message = params.message;

    const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Validación de ticket requerida</h2>
        
        <p style="margin: 15px 0;">Estimado <strong>${userName}</strong>:</p>
        
        <p style="margin: 15px 0;">El agente encargado ha culminado la atención del ticket <strong>${ticketCode}</strong> 
        y requiere tu validación.</p>
        

        
        ${message ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 4px; border: 1px solid #e5e7eb;">
            <strong style="display: block; margin-bottom: 10px; color: #374151;">Mensaje del agente:</strong>
            <div style="color: #4b5563;">${message}</div>
        </div>
        ` : ''}

        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>⚠️ Acción Requerida:</strong> Debes revisar el ticket y validar si la 
            atención fue satisfactoria.
            <br><br>
            Si no se valida en <strong>48 horas</strong>, el ticket se cerrará automáticamente.
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Revisar y validar ticket</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 13px; color: #6B7280; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            Puedes aprobar el cierre o rechazarlo si necesitas ajustes adicionales.
        </p>
    `;

    return getBaseTemplate(content, params.attentionAreaName);
}

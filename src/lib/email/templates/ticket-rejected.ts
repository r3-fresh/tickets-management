import { getBaseTemplate } from './base-template';
import { escapeHtml } from '../escape-html';

export interface TicketRejectedTemplateParams {
  userName: string;
  ticketCode: string;
  ticketUrl: string;
  attentionAreaName?: string;
  rejectionMessage?: string;
}

export function getTicketRejectedTemplate(params: TicketRejectedTemplateParams): string {
  const userName = escapeHtml(params.userName);
  const ticketCode = escapeHtml(params.ticketCode);

  const rejectionBlock = params.rejectionMessage
    ? `
        <div style="background-color: #FFF7ED; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-weight: bold; color: #9A3412;">Motivo de la solicitud de mejoras:</p>
            <p style="margin: 0; color: #7C2D12; white-space: pre-wrap;">${params.rejectionMessage}</p>
        </div>`
    : '';

  const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Validación rechazada</h2>
        
        <p style="margin: 15px 0;">Hola <strong>${userName}</strong>,</p>
        
        <p style="margin: 15px 0;">Has rechazado la solución propuesta para el ticket <strong>#${ticketCode}</strong>.</p>
        
        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991B1B;">
                El ticket se ha reabierto automáticamente y ha regresado al estado "En Progreso".
            </p>
        </div>

        ${rejectionBlock}

        <p style="margin: 15px 0;">Un agente revisará tus comentarios y continuará con la atención.</p>

        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver detalles del ticket</a>
        </div>
    `;

  return getBaseTemplate(content, params.attentionAreaName);
}

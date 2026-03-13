import { getBaseTemplate } from './base-template';
import { escapeHtml } from '../escape-html';

export interface DerivationTemplateParams {
  ticketCode: string;
  userName: string;
  providerName: string;
  estimatedDate?: string;
  ticketUrl: string;
  attentionAreaName?: string;
}

export function getDerivationTemplate(params: DerivationTemplateParams): string {
  const ticketCode = escapeHtml(params.ticketCode);
  const userName = escapeHtml(params.userName);
  const providerName = escapeHtml(params.providerName);

  const estimatedDateHtml = params.estimatedDate
    ? `<p style="margin: 10px 0; color: #4B5563;"><strong>Fecha estimada de atención:</strong> ${escapeHtml(params.estimatedDate)}</p>`
    : '';

  const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Derivación registrada en ticket #${ticketCode}</h2>
        
        <p style="margin: 15px 0;">El agente <strong>${userName}</strong> ha registrado una derivación a proveedor externo:</p>
        
        <div style="background-color: #FFFBEB; border-left: 4px solid #D97706; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 5px 0; color: #92400E; font-weight: bold;">Proveedor: ${providerName}</p>
            ${estimatedDateHtml}
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver detalles del ticket</a>
        </div>
        
    `;

  return getBaseTemplate(content, params.attentionAreaName);
}

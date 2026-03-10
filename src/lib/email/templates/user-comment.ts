import { getBaseTemplate } from './base-template';
import { escapeHtml } from '../escape-html';

export interface UserCommentTemplateParams {
  ticketCode: string;
  userName: string;
  userEmail: string;
  comment: string;
  ticketUrl: string;
  attentionAreaName?: string;
}

export function getUserCommentTemplate(params: UserCommentTemplateParams): string {
  const ticketCode = escapeHtml(params.ticketCode);
  const userName = escapeHtml(params.userName);
  const userEmail = escapeHtml(params.userEmail);
  // comment es HTML de TipTap (rich text), no se escapa
  const comment = params.comment;

  const content = `
        <h2 style="color: #333; font-size: 20px; margin-top: 0; text-align: center;">Nuevo comentario en ticket #${ticketCode}</h2>
        
        <p style="margin: 15px 0;">El usuario <strong>${userName}</strong> (${userEmail}) ha añadido un comentario al ticket:</p>
        
        <div style="background-color: #F9FAFB; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0;">
            <div style="color: #4B5563;">${comment}</div>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${params.ticketUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver detalles del ticket</a>
        </div>
        
    `;

  return getBaseTemplate(content, params.attentionAreaName);
}

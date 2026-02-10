/**
 * Escapa caracteres HTML especiales para prevenir XSS en templates de email.
 * NO usar para contenido rich text (HTML de TipTap) que debe renderizarse como HTML.
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

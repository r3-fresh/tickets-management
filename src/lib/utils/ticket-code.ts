import { db } from "@/db";
import { tickets } from "@/db/schema";
import { desc, like } from "drizzle-orm";

/**
 * Genera el próximo código de ticket para el año actual
 * Formato: YYYY-#### (ej: 2025-0001)
 * Se reinicia cada año automáticamente
 */
export async function generateNextTicketCode(): Promise<string> {
    const currentYear = new Date().getFullYear().toString();
    const yearPrefix = `${currentYear}-`;

    // Buscar el último ticket del año actual
    const lastTicket = await db
        .select({ ticketCode: tickets.ticketCode })
        .from(tickets)
        .where(like(tickets.ticketCode, `${yearPrefix}%`))
        .orderBy(desc(tickets.ticketCode))
        .limit(1);

    if (lastTicket.length === 0) {
        // Primer ticket del año
        return `${yearPrefix}0001`;
    }

    // Extraer el número del último ticket y sumar 1
    const lastCode = lastTicket[0].ticketCode;
    const lastNumber = parseInt(lastCode.split('-')[1]);
    const nextNumber = lastNumber + 1;

    // Formatear con ceros a la izquierda (4 dígitos)
    const nextCode = `${yearPrefix}${nextNumber.toString().padStart(4, '0')}`;

    return nextCode;
}

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Inserta un ticket con código atómico generado por la BD.
 * Formato: YYYY-#### (ej: 2026-0001). Se reinicia cada año.
 *
 * Usa una transacción que calcula el siguiente número secuencial
 * con CAST+SUBSTRING (ordenamiento numérico, no lexicográfico)
 * y reintenta hasta 3 veces ante colisión del constraint UNIQUE.
 */
export async function insertTicketWithCode(
    values: Omit<typeof tickets.$inferInsert, "ticketCode">
): Promise<{ id: number; ticketCode: string }> {
    const maxRetries = 3;
    const yearPrefix = `${new Date().getFullYear()}-`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const [result] = await db.transaction(async (tx) => {
                // Obtener el máximo número secuencial del año actual (numérico, no lexicográfico)
                const maxResult = await tx.execute(
                    sql`SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_code FROM 6) AS INTEGER)), 0) AS max_num
                        FROM ticket
                        WHERE ticket_code LIKE ${yearPrefix + "%"}`
                );

                const maxNum = Number(maxResult.rows[0].max_num);
                const nextNum = maxNum + 1;
                const ticketCode = `${yearPrefix}${nextNum.toString().padStart(4, "0")}`;

                // Insertar dentro de la misma transacción
                return tx
                    .insert(tickets)
                    .values({ ...values, ticketCode })
                    .returning({ id: tickets.id, ticketCode: tickets.ticketCode });
            });

            return result;
        } catch (error: unknown) {
            // Si es violación de UNIQUE constraint, reintentar
            const isUniqueViolation =
                error instanceof Error &&
                "code" in error &&
                (error as { code: string }).code === "23505";

            if (isUniqueViolation && attempt < maxRetries) {
                continue;
            }
            throw error;
        }
    }

    // Nunca debería llegar aquí, pero TypeScript lo requiere
    throw new Error("No se pudo generar el código de ticket después de múltiples intentos");
}

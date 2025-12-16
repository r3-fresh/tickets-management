
import { z } from "zod";

export const createTicketSchema = z.object({
    title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    priority: z.enum(["low", "medium", "high", "critical"]),
    categoryId: z.coerce.number().min(1, "Selecciona una categoría"),
    subcategory: z.string().min(1, "Selecciona una subcategoría"),
    ccEmails: z.string().optional(), // We'll parse this string into an array
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;

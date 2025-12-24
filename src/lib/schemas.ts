
import { z } from "zod";

export const createTicketSchema = z.object({
    title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    priority: z.enum(["low", "medium", "high", "critical"]),
    categoryId: z.coerce.number().min(1, "Selecciona una categoría"),
    subcategoryId: z.coerce.number().min(1, "Selecciona una subcategoría"),
    campusId: z.coerce.number().optional(),
    areaId: z.coerce.number().optional(), // Requester Area
    attentionAreaId: z.coerce.number().min(1, "Selecciona un área de atención"), // Target Area
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;

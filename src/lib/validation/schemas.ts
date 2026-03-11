
import { z } from "zod";

// Campos base compartidos por todos los formularios
const baseTicketFields = {
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  categoryId: z.coerce.number().min(1, "Selecciona una categoría"),
  subcategoryId: z.coerce.number().min(1, "Selecciona una subcategoría"),
  attentionAreaId: z.coerce.number().min(1, "Selecciona un área de atención"),
};

// ─── Server-side schemas (validación estricta en server actions) ───

// Schema para TSI y Fondo Editorial (con prioridad, sin campos de difusión)
export const createTicketSchema = z.object({
  ...baseTicketFields,
  priority: z.enum(["low", "medium", "high", "critical"]),
});

// Schema para Difusión (con prioridad + campos específicos)
export const createDiffusionTicketSchema = z.object({
  ...baseTicketFields,
  priority: z.enum(["low", "medium", "high", "critical"]),
  activityStartDate: z.string().min(1, "La fecha de inicio de la actividad es obligatoria"),
  desiredDiffusionDate: z.string().min(1, "La fecha deseada de difusión es obligatoria"),
  targetAudience: z.string().min(1, "El público objetivo es obligatorio"),
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;
export type CreateDiffusionTicketSchema = z.infer<typeof createDiffusionTicketSchema>;

// ─── Client-side unified schema (para useForm único en el formulario) ───
// Todos los campos opcionales específicos de área. La validación real ocurre
// en el server action con el schema específico de cada área.

export const createTicketFormSchema = z.object({
  ...baseTicketFields,
  // TSI/FE
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  // Difusión
  activityStartDate: z.string().optional(),
  desiredDiffusionDate: z.string().optional(),
  targetAudience: z.string().optional(),
});

export type CreateTicketFormSchema = z.infer<typeof createTicketFormSchema>;

// ─── Priority Config schemas (admin/agent config) ───

export const updatePriorityConfigSchema = z.object({
  id: z.coerce.number().min(1),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  slaHours: z.coerce.number().min(1, "El SLA debe ser al menos 1 hora"),
});

export type UpdatePriorityConfigSchema = z.infer<typeof updatePriorityConfigSchema>;

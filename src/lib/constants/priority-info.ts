import type { TicketPriority } from "@/types";

export const PRIORITY_DEFINITIONS: Record<TicketPriority, { description: string; sla: string }> = {
    low: {
        description: "Consultas generales, solicitudes de información o problemas menores que no afectan el funcionamiento.",
        sla: "Atención hasta en 5 días",
    },
    medium: {
        description: "Incidencias que afectan parcialmente el trabajo pero permiten continuar operando.",
        sla: "Atención hasta en 2 días",
    },
    high: {
        description: "Problemas que impiden realizar tareas críticas o afectan a múltiples usuarios.",
        sla: "Atención hasta en 1 día",
    },
    critical: {
        description: "Interrupción total del servicio, caída de sistemas o situaciones que requieren acción inmediata.",
        sla: "Evaluación inmediata",
    },
};


import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return "-";
    const d = new Date(date);
    return format(d, "dd/MM/yyyy HH:mm", { locale: es });
}

export function translateStatus(status: string): string {
    const map: Record<string, string> = {
        open: "Abierto",
        in_progress: "En Progreso",
        resolved: "Resuelto",
        voided: "Anulado",
    };
    return map[status] || status;
}

export function translatePriority(priority: string): string {
    const map: Record<string, string> = {
        low: "Baja",
        medium: "Media",
        high: "Alta",
        critical: "Crítica",
    };
    return map[priority] || priority;
}

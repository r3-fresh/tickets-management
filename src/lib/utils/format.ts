
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { STATUS_LABELS, PRIORITY_LABELS, CLOSURE_TYPE_LABELS } from "@/lib/constants/tickets";
import type { TicketStatus, TicketPriority, ClosedBy } from "@/types";

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return "-";
    const d = new Date(date);
    return format(d, "dd/MM/yyyy HH:mm", { locale: es });
}

export function translateStatus(status: TicketStatus): string {
    return STATUS_LABELS[status] || status;
}

export function translatePriority(priority: TicketPriority): string {
    return PRIORITY_LABELS[priority] || priority;
}

export function translateClosureType(closureType: ClosedBy): string {
    return CLOSURE_TYPE_LABELS[closureType] || closureType;
}

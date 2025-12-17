"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface TicketFiltersProps {
    onFilterChange: (filters: {
        status?: string;
        assignedTo?: string;
        dateRange?: DateRange;
    }) => void;
    assignedUsers: Array<{ id: string; name: string }>;
}

export function TicketFilters({ onFilterChange, assignedUsers }: TicketFiltersProps) {
    const [status, setStatus] = useState<string>("");
    const [assignedTo, setAssignedTo] = useState<string>("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const handleStatusChange = (value: string) => {
        const newStatus = value === "all" ? "" : value;
        setStatus(newStatus);
        onFilterChange({ status: newStatus, assignedTo, dateRange });
    };

    const handleAssignedToChange = (value: string) => {
        const newAssignedTo = value === "all" ? "" : value;
        setAssignedTo(newAssignedTo);
        onFilterChange({ status, assignedTo: newAssignedTo, dateRange });
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        onFilterChange({ status, assignedTo, dateRange: range });
    };

    const clearFilters = () => {
        setStatus("");
        setAssignedTo("");
        setDateRange(undefined);
        onFilterChange({});
    };

    const hasActiveFilters = status || assignedTo || dateRange;

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <Select value={status || "all"} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En Curso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="voided">Anulado</SelectItem>
                </SelectContent>
            </Select>

            <Select value={assignedTo || "all"} onValueChange={handleAssignedToChange}>
                <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue placeholder="Asignado a" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {assignedUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                            {user.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                                    {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                                </>
                            ) : (
                                format(dateRange.from, "dd MMM yyyy", { locale: es })
                            )
                        ) : (
                            <span>Rango de fechas</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeChange}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>

            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                </Button>
            )}
        </div>
    );
}

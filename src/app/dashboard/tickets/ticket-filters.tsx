import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { YearFilter } from "@/components/year-filter";

interface TicketFiltersProps {
    onFilterChange: (filters: {
        status?: string;
        assignedTo?: string;
        dateRange?: DateRange;
        category?: string;
        year?: string;
    }) => void;
    assignedUsers: Array<{ id: string; name: string }>;
    categories?: Array<{ id: number; name: string }>;
}

export function TicketFilters({ onFilterChange, assignedUsers, categories = [] }: TicketFiltersProps) {
    const [status, setStatus] = useState<string>("");
    const [assignedTo, setAssignedTo] = useState<string>("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [category, setCategory] = useState<string>("");
    const [year, setYear] = useState<string>("all");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex flex-wrap gap-3 items-center opacity-50 pointer-events-none">
                <Button variant="outline" disabled className="w-[180px]">Cargando...</Button>
                <Button variant="outline" disabled className="w-[200px]">Cargando...</Button>
                <Button variant="outline" disabled className="w-[280px]">Cargando...</Button>
            </div>
        );
    }

    const handleStatusChange = (value: string) => {
        const newStatus = value === "all" ? "" : value;
        setStatus(newStatus);
        onFilterChange({ status: newStatus, assignedTo, dateRange, category });
    };

    const handleAssignedToChange = (value: string) => {
        const newAssignedTo = value === "all" ? "" : value;
        setAssignedTo(newAssignedTo);
        onFilterChange({ status, assignedTo: newAssignedTo, dateRange, category });
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        onFilterChange({ status, assignedTo, dateRange: range, category });
    };

    const handleCategoryChange = (value: string) => {
        const newCategory = value === "all" ? "" : value;
        setCategory(newCategory);
        onFilterChange({ status, assignedTo, dateRange, category: newCategory, year });
    };

    const handleYearChange = (value: string) => {
        setYear(value);
        onFilterChange({ status, assignedTo, dateRange, category, year: value });
    };

    const clearFilters = () => {
        setStatus("");
        setAssignedTo("");
        setDateRange(undefined);
        setCategory("");
        setYear("all");
        onFilterChange({});
    };

    const hasActiveFilters = status || assignedTo || dateRange || category || year !== "all";

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <Select value={status || "all"} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
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
                <SelectTrigger className="w-[200px]">
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

            {categories.length > 0 && (
                <Select value={category || "all"} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

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
                        autoFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeChange}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
            <YearFilter value={year} onChange={handleYearChange} />

            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                </Button>
            )}
        </div>
    );
}

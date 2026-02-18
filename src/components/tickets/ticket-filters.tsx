"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { YearFilter } from "@/components/tickets/year-filter";

interface TicketFiltersProps {
    assignedUsers: Array<{ id: string; name: string }>;
    categories?: Array<{ id: number; name: string }>;
    subcategories?: Array<{ id: number; name: string; categoryId: number | null }>;
}

export function TicketFilters({ assignedUsers, categories = [], subcategories = [] }: TicketFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Leer valores actuales de los search params
    const status = searchParams.get("status") ?? "";
    const assignedTo = searchParams.get("assignedTo") ?? "";
    const category = searchParams.get("category") ?? "";
    const subcategory = searchParams.get("subcategory") ?? "";
    const year = searchParams.get("year") ?? "all";
    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";

    const dateRange: DateRange | undefined = dateFrom
        ? { from: new Date(dateFrom), to: dateTo ? new Date(dateTo) : undefined }
        : undefined;

    // Actualizar search params (resetea a página 1 al cambiar filtros)
    const updateParams = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        // Siempre resetear a página 1 al cambiar filtros
        params.delete("page");
        for (const [key, value] of Object.entries(updates)) {
            if (value && value !== "all") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        }
        router.push(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const handleStatusChange = (value: string) => {
        updateParams({ status: value === "all" ? "" : value });
    };

    const handleAssignedToChange = (value: string) => {
        updateParams({ assignedTo: value === "all" ? "" : value });
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        updateParams({
            dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : "",
        });
    };

    const handleCategoryChange = (value: string) => {
        // Reset subcategory when category changes
        updateParams({
            category: value === "all" ? "" : value,
            subcategory: ""
        });
    };

    const handleSubcategoryChange = (value: string) => {
        updateParams({ subcategory: value === "all" ? "" : value });
    };

    const handleYearChange = (value: string) => {
        updateParams({ year: value });
    };

    const clearFilters = () => {
        router.push("?", { scroll: false });
    };

    const hasActiveFilters = status || assignedTo || dateRange || category || subcategory || (year && year !== "all");

    // Filter available subcategories based on selected category
    const availableSubcategories = category && category !== 'all'
        ? subcategories.filter(s => s.categoryId === Number(category))
        : [];

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <Select value={status || "all"} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] bg-transparent">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En curso</SelectItem>
                    <SelectItem value="pending_validation">Pendiente de validación</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="voided">Anulado</SelectItem>
                </SelectContent>
            </Select>

            <Select value={assignedTo || "all"} onValueChange={handleAssignedToChange}>
                <SelectTrigger className="w-[200px] bg-transparent">
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
                    <SelectTrigger className="w-[200px] bg-transparent">
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

            {category && availableSubcategories.length > 0 && (
                <Select value={subcategory || "all"} onValueChange={handleSubcategoryChange}>
                    <SelectTrigger className="w-[200px] bg-transparent">
                        <SelectValue placeholder="Subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las subcategorías</SelectItem>
                        {availableSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id.toString()}>
                                {sub.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal bg-transparent">
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

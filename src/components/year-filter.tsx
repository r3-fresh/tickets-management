"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";

interface YearFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export function YearFilter({ value, onChange }: YearFilterProps) {
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => currentYear - i);
    }, []);

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por año" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

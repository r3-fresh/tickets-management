"use client";

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Filas por página:
                    </p>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                            onItemsPerPageChange(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                    Mostrando {startItem} - {endItem} de {totalItems} resultados
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={!canGoPrevious}
                    className="h-8 w-8 p-0"
                >
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="sr-only">Primera página</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoPrevious}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Página anterior</span>
                </Button>

                <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">
                        Página {currentPage} de {totalPages || 1}
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Página siguiente</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canGoNext}
                    className="h-8 w-8 p-0"
                >
                    <ChevronsRight className="h-4 w-4" />
                    <span className="sr-only">Última página</span>
                </Button>
            </div>
        </div>
    );
}

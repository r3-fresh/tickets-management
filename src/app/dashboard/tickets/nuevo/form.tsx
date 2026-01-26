"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, CreateTicketSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { createTicketAction } from "@/actions/tickets";
import { useState, useTransition } from "react";
import { Loader2, ArrowLeft, FileText, Tag, MapPin, AlertTriangle } from "lucide-react";
import { UserSelector } from "@/components/ui/user-selector";
import Link from "next/link";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { cn } from "@/lib/utils/cn";


interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

interface Category {
    id: number;
    name: string;
    attentionAreaId?: number | null;
    subcategories: Array<{
        id: number;
        name: string;
    }>;
}

interface Campus {
    id: number;
    name: string;
}

interface WorkArea {
    id: number;
    name: string;
}

interface AttentionArea {
    id: number;
    name: string;
    isAcceptingTickets: boolean;
}

interface NewTicketFormProps {
    availableUsers: User[];
    allowNewTickets?: boolean;
    categories: Category[];
    campuses: Campus[];
    workAreas: WorkArea[];
    attentionAreas: AttentionArea[];
    disabledMessage?: string | null;
}

export function NewTicketForm({
    availableUsers,
    allowNewTickets = true,
    categories,
    campuses,
    workAreas,
    attentionAreas,
    disabledMessage
}: NewTicketFormProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedAttentionArea, setSelectedAttentionArea] = useState<number | null>(null);
    const [selectedWatchers, setSelectedWatchers] = useState<string[]>([]);

    if (!allowNewTickets) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Creación de tickets temporalmente deshabilitada
                    </h2>
                    <p className="text-yellow-700 dark:text-yellow-300">
                        {disabledMessage || "Actualmente no se pueden crear nuevos tickets. Por favor, intenta más tarde o contacta al administrador."}
                    </p>
                    <div className="mt-6">
                        <Link href="/dashboard">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a mis tickets
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const form = useForm<CreateTicketSchema>({
        resolver: zodResolver(createTicketSchema) as any,
        defaultValues: {
            priority: "medium",
            title: "",
            description: "",
        },
    });

    const onSubmit = (data: CreateTicketSchema) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        // Add watchers
        formData.append("watchers", JSON.stringify(selectedWatchers));

        startTransition(async () => {
            const result = await createTicketAction(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Ticket creado correctamente");
            }
        });
    };

    // Filter categories based on attention Area
    const filteredCategories = selectedAttentionArea
        ? categories.filter(c => c.attentionAreaId === selectedAttentionArea)
        : [];

    const currentSubcategories = categories.find(c => c.id === selectedCategory)?.subcategories || [];

    const priorities = [
        { value: "low", label: "Baja", activeColor: "bg-green-500 hover:bg-green-600 text-white border-green-500", inactiveColor: "bg-muted hover:bg-muted/80 text-muted-foreground border-muted" },
        { value: "medium", label: "Media", activeColor: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500", inactiveColor: "bg-muted hover:bg-muted/80 text-muted-foreground border-muted" },
        { value: "high", label: "Alta", activeColor: "bg-orange-500 hover:bg-orange-600 text-white border-orange-500", inactiveColor: "bg-muted hover:bg-muted/80 text-muted-foreground border-muted" },
        { value: "critical", label: "Crítica", activeColor: "bg-red-500 hover:bg-red-600 text-white border-red-500", inactiveColor: "bg-muted hover:bg-muted/80 text-muted-foreground border-muted" },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Crear nuevo ticket</h1>
                <p className="text-muted-foreground mt-1">Completa el formulario para reportar un incidente o solicitar soporte</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Información General */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Información general</h2>
                            </div>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asunto del ticket <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: No funciona la conexión VPN en el portal" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nivel de prioridad <span className="text-red-500">*</span></FormLabel>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {priorities.map((priority) => (
                                                <button
                                                    key={priority.value}
                                                    type="button"
                                                    onClick={() => field.onChange(priority.value)}
                                                    className={cn(
                                                        "px-2 py-2 rounded-lg border-2 font-medium transition-all text-sm cursor-pointer",
                                                        field.value === priority.value
                                                            ? priority.activeColor
                                                            : priority.inactiveColor
                                                    )}
                                                >
                                                    {priority.label}
                                                </button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Clasificación de Incidente */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="attentionAreaId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Área de atención <span className="text-red-500">*</span></FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                const areaId = Number(val);
                                                field.onChange(areaId);
                                                setSelectedAttentionArea(areaId);
                                                // Reset category/subcategory if area changes
                                                form.setValue("categoryId", undefined as any);
                                                form.setValue("subcategoryId", undefined as any);
                                                setSelectedCategory(null);
                                            }}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione equipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {attentionAreas.map((area) => (
                                                    <SelectItem
                                                        key={area.id}
                                                        value={area.id.toString()}
                                                        disabled={!area.isAcceptingTickets}
                                                    >
                                                        {area.name} {!area.isAcceptingTickets && "(Cerrado)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoría <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(Number(val));
                                                    setSelectedCategory(Number(val));
                                                    form.setValue("subcategoryId", undefined as any);
                                                }}
                                                value={field.value?.toString()}
                                                disabled={!selectedAttentionArea || filteredCategories.length === 0}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione categoría" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredCategories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="subcategoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subcategoría <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value?.toString()}
                                                disabled={!selectedCategory || currentSubcategories.length === 0}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione subcategoría" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currentSubcategories.map((sub) => (
                                                        <SelectItem key={sub.id} value={sub.id.toString()}>
                                                            {sub.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormDescription>Selecciona primero el área para ver las categorías disponibles</FormDescription>
                        </div>

                        {/* Origen del Reporte */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="areaId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Su área de procedencia</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione su departamento" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {workAreas.map((area) => (
                                                        <SelectItem key={area.id} value={area.id.toString()}>
                                                            {area.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="campusId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Su campus procedencia</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione ubicación física" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {campuses.map((campus) => (
                                                        <SelectItem key={campus.id} value={campus.id.toString()}>
                                                            {campus.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Detalles del Requerimiento */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción detallada <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Describe el incidente, pasos para reproducir o solicitud específica..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Usuarios en seguimiento (Observadores)</FormLabel>
                                <UserSelector
                                    users={availableUsers}
                                    selectedUserIds={selectedWatchers}
                                    onSelectionChange={setSelectedWatchers}
                                    placeholder="Añadir nombre para agregar..."
                                />
                                <FormDescription className="mt-2">
                                    Estos usuarios recibirán notificaciones sobre actualizaciones de este ticket.
                                </FormDescription>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <Link href="/dashboard">
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear ticket
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {/* Emergency Notice */}
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold text-amber-900 dark:text-amber-200">¿Es una emergencia crítica?</p>
                    <p className="text-amber-800 dark:text-amber-300 mt-1">
                        Si el incidente afecta la operación de la planta o servicios críticos, por favor contacta directamente a la mesa de ayuda en la extensión <span className="font-bold">9999</span> después de crear este ticket.
                    </p>
                </div>
            </div>
        </div>
    );
}

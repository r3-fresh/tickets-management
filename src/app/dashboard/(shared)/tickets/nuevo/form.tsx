"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, CreateTicketSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { createTicketAction } from "@/actions/tickets";
import { useState, useTransition, useMemo, lazy, Suspense } from "react";
import {
    Loader2,
    ArrowLeft,
    AlertTriangle,
    Bell,
    Lightbulb,
    Paperclip,
} from "lucide-react";
import { UserSelector } from "@/components/ui/user-selector";
import Link from "next/link";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { cn } from "@/lib/utils/cn";
import { PRIORITY_STYLES } from "@/lib/constants/ticket-display";
import { PRIORITY_LABELS } from "@/lib/constants/tickets";
import type { TicketPriority } from "@/types";



const FileUpload = lazy(() =>
    import("@/components/shared/file-upload").then(mod => ({ default: mod.FileUpload }))
);


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

const PRIORITIES = (Object.keys(PRIORITY_STYLES) as TicketPriority[]).map((value) => {
    const style = PRIORITY_STYLES[value];
    return {
        value,
        label: PRIORITY_LABELS[value],
        activeColor: `${style.bg} ${style.text} ${style.border}`,
        inactiveColor: "bg-muted hover:bg-muted/80 text-muted-foreground border-transparent",
        hover: style.hover,
    };
});

// Contexto dinámico del panel lateral según el estado del formulario
function useSidebarContext(
    selectedAttentionArea: number | null,
    selectedCategory: number | null,
    attentionAreas: AttentionArea[],
    categories: Category[]
) {
    return useMemo(() => {
        if (!selectedAttentionArea) {
            return {
                title: "Comienza describiendo tu solicitud",
                tips: [
                    "Escribe un asunto claro y específico",
                    "Selecciona el área que atenderá tu caso",
                    "Mientras más detalle, más rápida la resolución",
                ],
            };
        }

        const area = attentionAreas.find(a => a.id === selectedAttentionArea);

        if (!selectedCategory) {
            return {
                title: area ? `Enviando a: ${area.name}` : "Área seleccionada",
                tips: [
                    "Selecciona la categoría que mejor describe tu caso",
                    "Esto ayuda al equipo a priorizar correctamente",
                    "Si no encuentras la categoría, elige la más cercana",
                ],
            };
        }

        const category = categories.find(c => c.id === selectedCategory);

        return {
            title: area ? `${area.name}` : "Casi listo",
            subtitle: category ? category.name : undefined,
            tips: [
                "Describe el problema con el mayor detalle posible",
                "Incluye pasos para reproducir el incidente si aplica",
                "Adjunta capturas o enlaces relevantes en la descripción",
            ],
        };
    }, [selectedAttentionArea, selectedCategory, attentionAreas, categories]);
}

// Progreso del formulario
function useFormProgress(formValues: Partial<CreateTicketSchema>, hasDescription: boolean) {
    return useMemo(() => {
        const fields = [
            { label: "Asunto", done: Boolean(formValues.title && formValues.title.length >= 5) },
            { label: "Clasificación", done: Boolean(formValues.attentionAreaId && formValues.categoryId) },
            { label: "Descripción", done: hasDescription },
            { label: "Prioridad", done: Boolean(formValues.priority) },
            { label: "Ubicación", done: Boolean(formValues.areaId || formValues.campusId) },
        ];
        const completed = fields.filter(f => f.done).length;
        return { fields, completed, total: fields.length };
    }, [formValues, hasDescription]);
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
    const [uploadToken] = useState(() => crypto.randomUUID());

    const form = useForm<CreateTicketSchema>({
        // zodResolver type mismatch with z.coerce.number() (Zod 4 + @hookform/resolvers 5.x)
        resolver: zodResolver(createTicketSchema) as Resolver<CreateTicketSchema>,
        defaultValues: {
            title: "",
            description: "",
        },
    });

    const watchedValues = form.watch();
    const hasDescription = Boolean(watchedValues.description && watchedValues.description.length >= 10);

    const sidebarContext = useSidebarContext(selectedAttentionArea, selectedCategory, attentionAreas, categories);
    const progress = useFormProgress(watchedValues, hasDescription);

    if (!allowNewTickets) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-muted border border-border rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Creación de tickets temporalmente deshabilitada
                    </h2>
                    <p className="text-muted-foreground">
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

    const onSubmit = (data: CreateTicketSchema) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        formData.append("watchers", JSON.stringify(selectedWatchers));
        formData.append("uploadToken", uploadToken);

        startTransition(async () => {
            const result = await createTicketAction(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Ticket creado correctamente");
            }
        });
    };

    // Filtrar categorías según área de atención
    const filteredCategories = selectedAttentionArea
        ? categories.filter(c => c.attentionAreaId === selectedAttentionArea)
        : [];

    const currentSubcategories = categories.find(c => c.id === selectedCategory)?.subcategories || [];

    return (
        <div className="max-w-6xl mx-auto pb-2">
            {/* Encabezado */}
            <div className="mb-5">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver
                </Link>
                <h1 className="text-2xl font-semibold tracking-tight">Nuevo requerimiento</h1>
            </div>

            <div className="flex gap-8 items-start">
                {/* ════════════════════════════════════════ */}
                {/* Panel principal                         */}
                {/* ════════════════════════════════════════ */}
                <div className="flex-1 min-w-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id="ticket-form">
                            {/* ── Card 1: Título + Clasificación ── */}
                            <div className="rounded-xl border border-border bg-card">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="p-0">
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    type="text"
                                                    placeholder="¿Qué necesitas resolver?"
                                                    className="w-full bg-transparent text-xl font-medium placeholder:text-muted-foreground/50 outline-none px-6 pt-6 pb-2 tracking-tight"
                                                    autoFocus
                                                    autoComplete="off"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage className="px-6 pb-2" />
                                        </FormItem>
                                    )}
                                />

                                {/* Clasificación — selectores compactos en línea */}
                                <div className="px-6 pb-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <FormField
                                            control={form.control}
                                            name="attentionAreaId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            const areaId = Number(val);
                                                            field.onChange(areaId);
                                                            setSelectedAttentionArea(areaId);
                                                            form.setValue("categoryId", undefined as unknown as number);
                                                            form.setValue("subcategoryId", undefined as unknown as number);
                                                            setSelectedCategory(null);
                                                        }}
                                                        value={field.value?.toString() ?? ""}
                                                        required
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger
                                                                size="sm"
                                                                className={cn(
                                                                    "w-fit text-xs rounded-md border gap-1 pl-2.5 pr-1.5 max-w-[200px]",
                                                                    field.value
                                                                        ? "border-foreground/15 text-foreground"
                                                                        : "border-dashed border-muted-foreground/30 text-muted-foreground"
                                                                )}
                                                            >
                                                                <SelectValue placeholder="Área de atención" />
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

                                        <span className="text-muted-foreground/30 text-sm select-none">/</span>

                                        <FormField
                                            control={form.control}
                                            name="categoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            field.onChange(Number(val));
                                                            setSelectedCategory(Number(val));
                                                            form.setValue("subcategoryId", undefined as unknown as number);
                                                        }}
                                                        value={field.value?.toString() ?? ""}
                                                        disabled={!selectedAttentionArea || filteredCategories.length === 0}
                                                        required
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger
                                                                size="sm"
                                                                className={cn(
                                                                    "w-fit text-xs rounded-md border gap-1 pl-2.5 pr-1.5 max-w-[200px]",
                                                                    field.value
                                                                        ? "border-foreground/15 text-foreground"
                                                                        : "border-dashed border-muted-foreground/30 text-muted-foreground"
                                                                )}
                                                            >
                                                                <SelectValue placeholder="Categoría" />
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

                                        <span className="text-muted-foreground/30 text-sm select-none">/</span>

                                        <FormField
                                            control={form.control}
                                            name="subcategoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value?.toString() ?? ""}
                                                        disabled={!selectedCategory || currentSubcategories.length === 0}
                                                        required
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger
                                                                size="sm"
                                                                className={cn(
                                                                    "w-fit text-xs rounded-md border gap-1 pl-2.5 pr-1.5 max-w-[200px]",
                                                                    field.value
                                                                        ? "border-foreground/15 text-foreground"
                                                                        : "border-dashed border-muted-foreground/30 text-muted-foreground"
                                                                )}
                                                            >
                                                                <SelectValue placeholder="Subcategoría" />
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
                                </div>

                                {/* Separador */}
                                <div className="mx-6 border-t border-border" />

                                {/* Prioridad */}
                                <div className="px-6 pb-5 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">
                                                    Prioridad <span className="text-muted-foreground">*</span>
                                                </FormLabel>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    Define la urgencia de tu solicitud para ayudar al equipo a priorizar
                                                </p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {PRIORITIES.map((priority) => (
                                                        <button
                                                            key={priority.value}
                                                            type="button"
                                                            onClick={() => field.onChange(priority.value)}
                                                            className={cn(
                                                                "py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer text-center",
                                                                field.value === priority.value
                                                                    ? priority.activeColor
                                                                    : cn("bg-background text-muted-foreground border-input/30 hover:border-input", priority.hover)
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
                            </div>

                            {/* ── Card 2: Ubicación ── */}
                            <div className="mt-5 rounded-xl border border-border bg-card p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="areaId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">
                                                    Área de procedencia <span className="text-muted-foreground">*</span>
                                                </FormLabel>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    El departamento o área al que perteneces
                                                </p>
                                                <Select
                                                    onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                    value={field.value?.toString() ?? ""}
                                                    required
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="text-xs border-border/80">
                                                            <SelectValue placeholder="¿De qué departamento eres?" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {workAreas.map((area) => (
                                                            <SelectItem key={area.id} value={area.id.toString()} className="text-xs">
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
                                                <FormLabel className="text-sm font-medium">
                                                    Campus <span className="text-muted-foreground">*</span>
                                                </FormLabel>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    La sede donde te encuentras físicamente
                                                </p>
                                                <Select
                                                    onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                    value={field.value?.toString() ?? ""}
                                                    required
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="text-xs border-border/80">
                                                            <SelectValue placeholder="¿En qué sede te encuentras?" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {campuses.map((campus) => (
                                                            <SelectItem key={campus.id} value={campus.id.toString()} className="text-xs">
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

                            {/* ── Card 3: Descripción + Archivos adjuntos (juntos al final) ── */}
                            <div className="mt-5 rounded-xl border border-border bg-card">
                                {/* Descripción */}
                                <div className="px-6 pt-5 pb-4">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">
                                                    Descripción <span className="text-muted-foreground">*</span>
                                                </FormLabel>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Detalla el problema o solicitud. Incluye pasos para reproducirlo, contexto relevante y el resultado esperado.
                                                </p>
                                                <FormControl>
                                                    <RichTextEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Ej: Al intentar acceder al sistema de notas, aparece un error 500. Esto ocurre desde ayer..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Separador */}
                                <div className="mx-6 border-t border-border" />

                                {/* Archivos adjuntos */}
                                <div className="px-6 pt-4 pb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-sm font-medium">Archivos adjuntos</p>
                                        <span className="text-xs text-muted-foreground">(opcional)</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Adjunta capturas de pantalla, documentos u otros archivos relevantes. Máximo 50 MB por archivo.
                                    </p>
                                    <Suspense fallback={<div className="h-20 animate-pulse rounded-md bg-muted" />}>
                                        <FileUpload uploadToken={uploadToken} />
                                    </Suspense>
                                </div>
                            </div>

                            {/* ── Notificar a — solo visible en móvil (en desktop va al sidebar) ── */}
                            <div className="mt-3 rounded-xl border border-border bg-card p-5 lg:hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                                    <p className="text-sm font-medium">Notificar a</p>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Estas personas recibirán notificaciones sobre cada actualización del ticket
                                </p>
                                <UserSelector
                                    users={availableUsers}
                                    selectedUserIds={selectedWatchers}
                                    onSelectionChange={setSelectedWatchers}
                                    placeholder="Buscar personas..."
                                />
                            </div>

                            {/* ── Barra sticky — solo en móvil (sin sidebar) ── */}
                            <div className="sticky bottom-0 mt-6 lg:hidden">
                                <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-5 py-3.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {progress.completed} de {progress.total}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Link href="/dashboard">
                                                <Button type="button" variant="ghost" size="sm">
                                                    Cancelar
                                                </Button>
                                            </Link>
                                            <Button type="submit" size="sm" disabled={isPending}>
                                                {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                                Crear ticket
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form >
                </div >

                {/* ════════════════════════════════════════ */}
                {/* Panel lateral (desktop)                 */}
                {/* ════════════════════════════════════════ */}
                <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 sticky top-4 gap-4">
                    {/* Tarjeta 1: progreso + tips */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        {/* Progreso — indicador compacto */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                {progress.fields.map((field, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1.5 w-5 rounded-full transition-colors duration-300",
                                            field.done ? "bg-foreground" : "bg-muted-foreground/15"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">
                                {progress.completed}/{progress.total}
                            </span>
                        </div>

                        <div className="border-t border-border" />

                        {/* Contexto dinámico */}
                        <div>
                            <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-foreground leading-snug">{sidebarContext.title}</p>
                                    {sidebarContext.subtitle && (
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{sidebarContext.subtitle}</p>
                                    )}
                                </div>
                            </div>
                            <ul className="space-y-1.5 pl-5.5">
                                {sidebarContext.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                        <span className="text-muted-foreground/40 mt-px text-[11px] leading-none">&mdash;</span>
                                        <span className="text-[11px] text-muted-foreground leading-relaxed">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t border-border" />

                        {/* Aviso de emergencia */}
                        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-3 py-2.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-medium text-amber-900 dark:text-amber-200">¿Es una emergencia?</p>
                                <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                                    Contáctanos directamente en los chats grupales después de crear el ticket.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 2: Notificar a (observadores) */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm font-medium">Notificar a</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Estas personas recibirán notificaciones sobre cada actualización del ticket
                        </p>
                        <UserSelector
                            users={availableUsers}
                            selectedUserIds={selectedWatchers}
                            onSelectionChange={setSelectedWatchers}
                            placeholder="Buscar personas..."
                        />
                    </div>

                    {/* Tarjeta 3: Acciones */}
                    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                            onClick={() => {
                                const formEl = document.getElementById("ticket-form") as HTMLFormElement | null;
                                if (formEl) formEl.requestSubmit();
                            }}
                        >
                            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                            Crear ticket
                        </Button>
                        <Link href="/dashboard" className="block">
                            <Button type="button" variant="ghost" size="sm" className="w-full">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </aside>
            </div >
        </div >
    );
}

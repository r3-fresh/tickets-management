"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, CreateTicketSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createTicketAction } from "@/app/actions/tickets";
import { useState, useTransition } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { UserSelector } from "@/components/ui/user-selector";
import Link from "next/link";
import { RichTextEditor } from "@/components/rich-text-editor";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

interface Category {
    id: number;
    name: string;
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

interface NewTicketFormProps {
    availableUsers: User[];
    allowNewTickets?: boolean;
    categories: Category[];
    campuses: Campus[];
    workAreas: WorkArea[];
    disabledMessage?: string | null;
}

export function NewTicketForm({
    availableUsers,
    allowNewTickets = true,
    categories,
    campuses,
    workAreas,
    disabledMessage
}: NewTicketFormProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedWatchers, setSelectedWatchers] = useState<string[]>([]);

    if (!allowNewTickets) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                        Creación de Tickets Temporalmente Deshabilitada
                    </h2>
                    <p className="text-yellow-700">
                        {disabledMessage || "Actualmente no se pueden crear nuevos tickets. Por favor, intenta más tarde o contacta al administrador."}
                    </p>
                    <div className="mt-6">
                        <Link href="/dashboard/tickets" className="text-blue-600 hover:underline">
                            Volver a Mis Tickets
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

    const currentSubcategories = categories.find(c => c.id === selectedCategory)?.subcategories || [];

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Link href="/dashboard/tickets" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Mis Tickets
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Crear Nuevo Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asunto <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Error al ingresar al sistema" {...field} />
                                        </FormControl>
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
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
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
                                                        <SelectValue placeholder="Selecciona..." />
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

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridad <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Baja</SelectItem>
                                                <SelectItem value="medium">Media</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                                <SelectItem value="critical">Crítica</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="areaId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Área <span className="text-gray-400 font-normal">(Opcional)</span></FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona..." />
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
                                            <FormLabel>Campus <span className="text-gray-400 font-normal">(Opcional)</span></FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona..." />
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

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción Detallada <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Describa el problema o requerimiento..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>
                                <FormLabel>Usuarios a Notificar <span className="text-gray-400 font-normal">(Opcional)</span></FormLabel>
                                <UserSelector
                                    users={availableUsers}
                                    selectedUserIds={selectedWatchers}
                                    onSelectionChange={setSelectedWatchers}
                                    placeholder="Seleccionar usuarios para notificar..."
                                />
                                <FormDescription className="mt-2">
                                    Estos usuarios podrán ver y monitorear el estado del ticket.
                                </FormDescription>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Crear Ticket
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

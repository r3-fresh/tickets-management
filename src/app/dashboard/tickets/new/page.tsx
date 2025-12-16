
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, CreateTicketSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createTicketAction } from "@/app/actions/ticket-actions";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

// Mock categories for now since DB might be down
const CATEGORIES = [
    { id: 1, name: "Sistema de Gestión Bibliotecaria", subcategories: ["Accesos", "Reportes", "Errores", "Mejoras"] },
    { id: 2, name: "Plataformas Web", subcategories: ["Landing Pages", "Intranet", "Portal de Clientes", "CMS"] },
    { id: 3, name: "Sistematización y Reportería", subcategories: ["Power BI", "Excel Automations", "Dashboards"] },
    { id: 4, name: "Infraestructura y Redes", subcategories: ["VPN", "Wifi", "Hardware", "Software License"] },
];

export default function NewTicketPage() {
    const [isPending, startTransition] = useTransition();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    const form = useForm({
        resolver: zodResolver(createTicketSchema),
        defaultValues: {
            priority: "medium",
            title: "",
            description: "",
            ccEmails: "",
        },
    });

    const onSubmit = (data: CreateTicketSchema) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });

        startTransition(async () => {
            const result = await createTicketAction(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Ticket creado correctamente");
            }
        });
    };

    const currentSubcategories = CATEGORIES.find(c => c.id === selectedCategory)?.subcategories || [];

    return (
        <div className="max-w-2xl mx-auto">
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
                                        <FormLabel>Asunto</FormLabel>
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
                                            <FormLabel>Categoría</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    setSelectedCategory(Number(val));
                                                    form.setValue("subcategory", ""); // Reset subcategory
                                                }}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CATEGORIES.map((cat) => (
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
                                    name="subcategory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subcategoría</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCategory}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currentSubcategories.map((sub) => (
                                                        <SelectItem key={sub} value={sub}>
                                                            {sub}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prioridad</FormLabel>
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
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción Detallada</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describa el problema o requerimiento..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ccEmails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CC (Correos adicionales)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="correo1@empresa.com, correo2@empresa.com" {...field} />
                                        </FormControl>
                                        <FormDescription>Separa múltiples correos con comas.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

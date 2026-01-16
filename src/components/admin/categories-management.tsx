"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import {
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    moveCategoryUp,
    moveCategoryDown,
} from "@/actions/admin/categories";

interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    displayOrder: number;
    attentionAreaId?: number | null;
    subcategories?: Subcategory[];
}

interface Subcategory {
    id: number;
    name: string;
    isActive: boolean;
}

interface AttentionArea {
    id: number;
    name: string;
}

interface AdminCategoriesManagementProps {
    initialCategories: Category[];
    attentionAreas: AttentionArea[];
}

export function AdminCategoriesManagement({
    initialCategories,
    attentionAreas
}: AdminCategoriesManagementProps) {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true,
        attentionAreaId: undefined as number | undefined,
    });

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            isActive: true,
            attentionAreaId: undefined
        });
        setEditingCategory(null);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            isActive: category.isActive,
            attentionAreaId: category.attentionAreaId || undefined,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        startTransition(async () => {
            let result;
            if (editingCategory) {
                result = await updateCategory(
                    editingCategory.id,
                    formData.name,
                    formData.description,
                    formData.isActive,
                    formData.attentionAreaId
                );
            } else {
                result = await createCategory(
                    formData.name,
                    formData.description,
                    formData.isActive,
                    formData.attentionAreaId
                );
            }

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(editingCategory ? "Categoría actualizada" : "Categoría creada");
                setIsDialogOpen(false);
                resetForm();
                router.refresh();
            }
        });
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        startTransition(async () => {
            const result = await deleteCategory(deleteId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Categoría eliminada");
                setDeleteId(null);
                router.refresh();
            }
        });
    };

    const handleToggleActive = (id: number) => {
        startTransition(async () => {
            const result = await toggleCategoryActive(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Estado actualizado");
                router.refresh();
            }
        });
    };

    const handleMoveUp = (id: number, currentOrder: number) => {
        startTransition(async () => {
            const result = await moveCategoryUp(id, currentOrder);
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh();
            }
        });
    };

    const handleMoveDown = (id: number, currentOrder: number) => {
        startTransition(async () => {
            const result = await moveCategoryDown(id, currentOrder);
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {initialCategories.length} categoría(s) total(es)
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Categoría
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? "Modifica los datos de la categoría"
                                    : "Crea una nueva categoría para los tickets"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Soporte Técnico"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attentionArea">Área de Atención</Label>
                                <Select
                                    value={formData.attentionAreaId?.toString() || "none"}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            attentionAreaId: value === "none" ? undefined : Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar área..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin área específica</SelectItem>
                                        {attentionAreas.map((area) => (
                                            <SelectItem key={area.id} value={area.id.toString()}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Los tickets de esta categoría se asignarán a esta área.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, isActive: checked })
                                    }
                                />
                                <Label htmlFor="isActive" className="cursor-pointer">
                                    Categoría activa
                                </Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={isPending}>
                                {editingCategory ? "Actualizar" : "Crear"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Área de Atención</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Subcategorías</TableHead>
                            <TableHead className="w-[100px]">Estado</TableHead>
                            <TableHead className="w-[150px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No hay categorías. Crea una nueva.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialCategories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        {category.attentionAreaId
                                            ? attentionAreas.find((a) => a.id === category.attentionAreaId)?.name || "N/A"
                                            : "Todas"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {category.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {category.subcategories?.length || 0} subcategoría(s)
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={category.isActive}
                                            onCheckedChange={() => handleToggleActive(category.id)}
                                            disabled={isPending}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMoveUp(category.id, category.displayOrder)}
                                                disabled={index === 0 || isPending}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMoveDown(category.id, category.displayOrder)}
                                                disabled={index === initialCategories.length - 1 || isPending}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(category)}
                                                disabled={isPending}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteId(category.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DeleteConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="¿Eliminar categoría?"
                description="Esta acción no se puede deshacer. Se eliminarán también todas las subcategorías asociadas."
            />
        </div>
    );
}

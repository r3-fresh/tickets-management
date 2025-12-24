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
} from "@/app/actions/admin/categories";

interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    displayOrder: number;
    attentionAreaId?: number | null;
}

interface AttentionArea {
    id: number;
    name: string;
}

interface CategoriesManagementProps {
    initialCategories: Category[];
    attentionAreas: AttentionArea[];
}

export function CategoriesManagement({ initialCategories, attentionAreas }: CategoriesManagementProps) {
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
        setFormData({ name: "", description: "", isActive: true, attentionAreaId: undefined });
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
            const areaId = formData.attentionAreaId ? Number(formData.attentionAreaId) : undefined;

            const result = editingCategory
                ? await updateCategory(editingCategory.id, formData.name, formData.description, formData.isActive, areaId)
                : await createCategory(formData.name, formData.description, formData.isActive, areaId);

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

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (!deleteId) return;

        startTransition(async () => {
            const result = await deleteCategory(deleteId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Categoría eliminada");
                router.refresh();
            }
            setDeleteId(null);
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

    const handleMoveUp = (id: number, displayOrder: number) => {
        startTransition(async () => {
            const result = await moveCategoryUp(id, displayOrder);
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh();
            }
        });
    };

    const handleMoveDown = (id: number, displayOrder: number) => {
        startTransition(async () => {
            const result = await moveCategoryDown(id, displayOrder);
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {initialCategories.length} categoría(s) total(es)
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Categoría
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? "Modifica los datos de la categoría"
                                    : "Crea una nueva categoría de tickets"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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
                                <Label htmlFor="area">Área de Atención</Label>
                                <Select
                                    value={formData.attentionAreaId?.toString()}
                                    onValueChange={(val) => setFormData({ ...formData, attentionAreaId: Number(val) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un área..." />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                    placeholder="Descripción opcional de la categoría"
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Activo</Label>
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

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Orden</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Área de Atención</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="w-[100px]">Estado</TableHead>
                            <TableHead className="w-[150px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No hay categorías creadas
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialCategories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="flex gap-1">
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
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        {category.attentionAreaId
                                            ? attentionAreas.find(a => a.id === category.attentionAreaId)?.name || "Desconocida"
                                            : <span className="text-muted-foreground italic">Sin asignar</span>}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {category.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={category.isActive}
                                            onCheckedChange={() => handleToggleActive(category.id)}
                                            disabled={isPending}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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
                                                onClick={() => handleDelete(category.id)}
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
                onConfirm={confirmDelete}
                title="Eliminar Categoría"
                description="¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer y puede afectar tickets existentes."
            />
        </div>
    );
}

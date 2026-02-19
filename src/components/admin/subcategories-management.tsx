"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryActive,
    moveSubcategoryUp,
    moveSubcategoryDown,
} from "@/actions/admin/subcategories";

interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    categoryId: number;
    name: string;
    description: string | null;
    isActive: boolean;
    displayOrder: number;
    category?: Category;
}

interface SubcategoriesManagementProps {
    initialSubcategories: Subcategory[];
    categories: Category[];
}

export function SubcategoriesManagement({ initialSubcategories, categories }: SubcategoriesManagementProps) {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
    const router = useRouter();

    const [formData, setFormData] = useState({
        categoryId: "",
        name: "",
        description: "",
        isActive: true,
    });

    const filteredSubcategories = useMemo(() => {
        if (filterCategoryId === "all") return initialSubcategories;
        return initialSubcategories.filter(sub => sub.categoryId.toString() === filterCategoryId);
    }, [initialSubcategories, filterCategoryId]);

    // Pre-compute subcategories grouped by categoryId for O(1) lookup per row
    const subcategoriesByCategoryId = useMemo(() => {
        const map = new Map<number, Subcategory[]>();
        for (const sub of initialSubcategories) {
            const list = map.get(sub.categoryId);
            if (list) {
                list.push(sub);
            } else {
                map.set(sub.categoryId, [sub]);
            }
        }
        return map;
    }, [initialSubcategories]);

    const resetForm = () => {
        setFormData({ categoryId: "", name: "", description: "", isActive: true });
        setEditingSubcategory(null);
    };

    const handleEdit = (subcategory: Subcategory) => {
        setEditingSubcategory(subcategory);
        setFormData({
            categoryId: subcategory.categoryId.toString(),
            name: subcategory.name,
            description: subcategory.description || "",
            isActive: subcategory.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.categoryId || !formData.name.trim()) {
            toast.error("La categoría y el nombre son requeridos");
            return;
        }

        startTransition(async () => {
            const result = editingSubcategory
                ? await updateSubcategory(
                    editingSubcategory.id,
                    parseInt(formData.categoryId),
                    formData.name,
                    formData.description,
                    formData.isActive
                )
                : await createSubcategory(
                    parseInt(formData.categoryId),
                    formData.name,
                    formData.description,
                    formData.isActive
                );

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(editingSubcategory ? "Subcategoría actualizada" : "Subcategoría creada");
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
            const result = await deleteSubcategory(deleteId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Subcategoría eliminada");
                router.refresh();
            }
            setDeleteId(null);
        });
    };

    const handleToggleActive = (id: number) => {
        startTransition(async () => {
            const result = await toggleSubcategoryActive(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Estado actualizado");
                router.refresh();
            }
        });
    };

    const handleMoveUp = (id: number, categoryId: number, displayOrder: number) => {
        startTransition(async () => {
            const result = await moveSubcategoryUp(id, categoryId, displayOrder);
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh();
            }
        });
    };

    const handleMoveDown = (id: number, categoryId: number, displayOrder: number) => {
        startTransition(async () => {
            const result = await moveSubcategoryDown(id, categoryId, displayOrder);
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {filteredSubcategories.length} subcategoría(s)
                        {filterCategoryId !== "all" && " en esta categoría"}
                    </p>
                    <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Filtrar por categoría" />
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
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva subcategoría
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingSubcategory ? "Editar subcategoría" : "Nueva subcategoría"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingSubcategory
                                    ? "Modifica los datos de la subcategoría"
                                    : "Crea una nueva subcategoría de tickets"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría *</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ej: Hardware"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripción opcional de la subcategoría"
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                />
                                <Label htmlFor="isActive">Activo</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={isPending}>
                                {editingSubcategory ? "Actualizar" : "Crear"}
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
                            <TableHead>Categoría</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="w-[100px]">Estado</TableHead>
                            <TableHead className="w-[150px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubcategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    {filterCategoryId === "all"
                                        ? "No hay subcategorías creadas"
                                        : "No hay subcategorías en esta categoría"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSubcategories.map((subcategory, index) => {
                                const categorySubcategories = subcategoriesByCategoryId.get(subcategory.categoryId) || [];
                                const indexInCategory = categorySubcategories.findIndex(s => s.id === subcategory.id);

                                return (
                                    <TableRow key={subcategory.id}>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMoveUp(subcategory.id, subcategory.categoryId, subcategory.displayOrder)}
                                                    disabled={indexInCategory === 0 || isPending}
                                                    aria-label={`Mover arriba ${subcategory.name}`}
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMoveDown(subcategory.id, subcategory.categoryId, subcategory.displayOrder)}
                                                    disabled={indexInCategory === categorySubcategories.length - 1 || isPending}
                                                    aria-label={`Mover abajo ${subcategory.name}`}
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {subcategory.category?.name || categories.find(c => c.id === subcategory.categoryId)?.name}
                                        </TableCell>
                                        <TableCell className="font-medium">{subcategory.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                                            <span className="block truncate" title={subcategory.description || ""}>
                                                {subcategory.description || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={subcategory.isActive}
                                                onCheckedChange={() => handleToggleActive(subcategory.id)}
                                                disabled={isPending}
                                                aria-label={`${subcategory.isActive ? "Desactivar" : "Activar"} subcategoría ${subcategory.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(subcategory)}
                                                    disabled={isPending}
                                                    aria-label={`Editar ${subcategory.name}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(subcategory.id)}
                                                    disabled={isPending}
                                                    aria-label={`Eliminar ${subcategory.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <DeleteConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Eliminar subcategoría"
                description="¿Estás seguro de eliminar esta subcategoría? Esta acción no se puede deshacer y puede afectar tickets existentes."
            />
        </div>
    );
}

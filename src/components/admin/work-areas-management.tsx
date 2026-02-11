"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { toast } from "sonner";
import { createWorkArea, updateWorkArea, deleteWorkArea, toggleWorkAreaActive } from "@/actions/admin/work-areas";

interface WorkArea {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
}

interface WorkAreasManagementProps {
    initialAreas: WorkArea[];
}

export function WorkAreasManagement({ initialAreas }: WorkAreasManagementProps) {
    const [isPending, startTransition] = useTransition();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<WorkArea | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true,
    });

    const resetForm = () => {
        setFormData({ name: "", description: "", isActive: true });
        setEditingArea(null);
    };

    const handleEdit = (area: WorkArea) => {
        setEditingArea(area);
        setFormData({
            name: area.name,
            description: area.description || "",
            isActive: area.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        startTransition(async () => {
            const result = editingArea
                ? await updateWorkArea(editingArea.id, formData.name, formData.description, formData.isActive)
                : await createWorkArea(formData.name, formData.description, formData.isActive);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(editingArea ? "Área actualizada" : "Área creada");
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
            const result = await deleteWorkArea(deleteId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Área eliminada");
                router.refresh();
            }
            setDeleteId(null);
        });
    };

    const handleToggleActive = (id: number) => {
        startTransition(async () => {
            const result = await toggleWorkAreaActive(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Estado actualizado");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {initialAreas.length} área(s) de trabajo total(es)
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva área
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingArea ? "Editar área de trabajo" : "Nueva área de trabajo"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingArea
                                    ? "Modifica los datos del área de trabajo"
                                    : "Crea una nueva área de trabajo"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ej: Recursos Humanos"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripción opcional del área"
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
                                {editingArea ? "Actualizar" : "Crear"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="w-[100px]">Estado</TableHead>
                            <TableHead className="w-[150px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialAreas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No hay áreas de trabajo creadas
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialAreas.map((area) => (
                                <TableRow key={area.id}>
                                    <TableCell className="font-medium">{area.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {area.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={area.isActive}
                                            onCheckedChange={() => handleToggleActive(area.id)}
                                            disabled={isPending}
                                            aria-label={`${area.isActive ? "Desactivar" : "Activar"} área ${area.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(area)}
                                                disabled={isPending}
                                                aria-label={`Editar ${area.name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(area.id)}
                                                disabled={isPending}
                                                aria-label={`Eliminar ${area.name}`}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
            <DeleteConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Eliminar área de trabajo"
                description="¿Estás seguro de eliminar esta área de trabajo? Esta acción no se puede deshacer."
            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

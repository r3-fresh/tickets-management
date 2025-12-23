"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { createCampus, updateCampus, deleteCampus, toggleCampusActive } from "@/app/actions/admin/campus";

interface Campus {
    id: number;
    name: string;
    code: string | null;
    isActive: boolean;
}

interface CampusManagementProps {
    initialCampus: Campus[];
}

export function CampusManagement({ initialCampus }: CampusManagementProps) {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        isActive: true,
    });

    const resetForm = () => {
        setFormData({ name: "", code: "", isActive: true });
        setEditingCampus(null);
    };

    const handleEdit = (campus: Campus) => {
        setEditingCampus(campus);
        setFormData({
            name: campus.name,
            code: campus.code || "",
            isActive: campus.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name.trim() || !formData.code.trim()) {
            toast.error("El nombre y código son requeridos");
            return;
        }

        startTransition(async () => {
            const result = editingCampus
                ? await updateCampus(editingCampus.id, formData.name, formData.code, formData.isActive)
                : await createCampus(formData.name, formData.code, formData.isActive);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(editingCampus ? "Campus actualizado" : "Campus creado");
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
            const result = await deleteCampus(deleteId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Campus eliminado");
                router.refresh();
            }
            setDeleteId(null);
        });
    };

    const handleToggleActive = (id: number) => {
        startTransition(async () => {
            const result = await toggleCampusActive(id);
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
                    {initialCampus.length} campus total(es)
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Campus
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCampus ? "Editar Campus" : "Nuevo Campus"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCampus
                                    ? "Modifica los datos del campus"
                                    : "Crea una nueva ubicación de campus"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Campus Principal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Código *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Ej: CP-01"
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
                                {editingCampus ? "Actualizar" : "Crear"}
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
                            <TableHead>Código</TableHead>
                            <TableHead className="w-[100px]">Estado</TableHead>
                            <TableHead className="w-[150px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCampus.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No hay campus creados
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialCampus.map((campus) => (
                                <TableRow key={campus.id}>
                                    <TableCell className="font-medium">{campus.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{campus.code || "-"}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={campus.isActive}
                                            onCheckedChange={() => handleToggleActive(campus.id)}
                                            disabled={isPending}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(campus)}
                                                disabled={isPending}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(campus.id)}
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
                title="Eliminar Campus"
                description="¿Estás seguro de eliminar este campus? Esta acción no se puede deshacer."
            />
        </div>
    )
}

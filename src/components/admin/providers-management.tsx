"use client";

import { createProviderAction, updateProviderAction } from "@/actions/admin/providers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ProviderItem {
  id: number;
  name: string;
  attentionAreaId: number;
  isActive: boolean;
}

interface AttentionArea {
  id: number;
  name: string;
  slug: string;
}

interface ProvidersManagementProps {
  providers: ProviderItem[];
  attentionAreas: AttentionArea[];
}

export function ProvidersManagement({ providers, attentionAreas }: ProvidersManagementProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(
    attentionAreas[0]?.id.toString() ?? ""
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderItem | null>(null);

  const areaProviders = providers.filter(
    (p) => p.attentionAreaId === Number(selectedAreaId)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Label htmlFor="area-select-providers" className="text-sm font-medium whitespace-nowrap">
            Área de atención:
          </Label>
          <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
            <SelectTrigger id="area-select-providers" className="w-64">
              <SelectValue placeholder="Selecciona un área" />
            </SelectTrigger>
            <SelectContent>
              {attentionAreas.map((area) => (
                <SelectItem key={area.id} value={area.id.toString()}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingProvider(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo proveedor
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areaProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No hay proveedores registrados para esta área.
                </TableCell>
              </TableRow>
            ) : (
              areaProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        provider.isActive
                          ? "bg-foreground/10 text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {provider.isActive ? "Activo" : "Inactivo"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProvider(provider);
                        setIsDialogOpen(true);
                      }}
                      aria-label={`Editar ${provider.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProviderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        provider={editingProvider}
        areaId={Number(selectedAreaId)}
      />
    </div>
  );
}

function ProviderDialog({
  open,
  onOpenChange,
  provider,
  areaId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderItem | null;
  areaId: number;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (provider) {
        // Update existing
        formData.append("id", provider.id.toString());
        formData.append("isActive", formData.get("isActive") === "on" ? "true" : "false");
        const result = await updateProviderAction(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Proveedor actualizado");
          onOpenChange(false);
        }
      } else {
        // Create new
        formData.append("attentionAreaId", areaId.toString());
        const result = await createProviderAction(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Proveedor creado");
          onOpenChange(false);
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
          <DialogDescription>
            {provider
              ? "Modifica los datos del proveedor."
              : "Crea un nuevo proveedor para el área seleccionada."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={provider?.name}
              required
              placeholder="Ej: Elogim"
            />
          </div>
          {provider && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                defaultChecked={provider.isActive}
              />
              <Label htmlFor="isActive">Activo</Label>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

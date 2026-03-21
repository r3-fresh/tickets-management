"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createProviderTicketAction,
  updateProviderTicketAction,
  closeProviderTicketAction,
  reopenProviderTicketAction,
  deleteProviderTicketAction,
} from "@/actions/agent/provider-tickets";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PROVIDER_TICKET_STATUS_LABELS, PROVIDER_TICKET_PRIORITY_LABELS, PROVIDER_TICKET_PRIORITY_STYLES } from "@/lib/constants/tickets";
import { cn } from "@/lib/utils/cn";
import { dayjs, formatDateShort } from "@/lib/utils/date";
import type { Provider, ProviderTicketStatus, ProviderTicketPriority } from "@/types";
import {
  CalendarIcon,
  Check,
  CheckCircle,
  ChevronsUpDown,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { es } from "react-day-picker/locale";
import { toast } from "sonner";

// --- Types ---

interface AreaTicket {
  id: number;
  ticketCode: string;
  title: string;
}

interface ProviderTicketRow {
  id: number;
  externalCode: string;
  title: string;
  requestDate: string;
  description: string;
  status: string;
  priority: string | null;
  providerId: number;
  ticketId: number | null;
  completionDate: string | null;
  attentionAreaId: number;
  requestedById: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  provider: {
    id: number;
    name: string;
  };
  requestedBy: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  ticket: {
    id: number;
    ticketCode: string;
    title: string;
  } | null;
}

interface ProviderTicketsListProps {
  providerTickets: ProviderTicketRow[];
  providers: Provider[];
  areaTickets: AreaTicket[];
}

// --- Main Component ---

export function ProviderTicketsList({ providerTickets, providers, areaTickets }: ProviderTicketsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<ProviderTicketRow | null>(null);

  // Close dialog state
  const [closingTicket, setClosingTicket] = useState<ProviderTicketRow | null>(null);

  // Delete state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filters
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Derive unique providers from existing tickets for filter
  const providerOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of providerTickets) {
      map.set(t.provider.id, t.provider.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [providerTickets]);

  // Apply filters
  const filteredTickets = useMemo(() => {
    return providerTickets.filter((t) => {
      if (filterProvider !== "all" && t.providerId !== Number(filterProvider)) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      return true;
    });
  }, [providerTickets, filterProvider, filterStatus]);

  // Delete handler
  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteProviderTicketAction(deleteId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket de proveedor eliminado");
        setDeleteId(null);
        router.refresh();
      }
    });
  };

  // Reopen handler
  const handleReopen = (id: number) => {
    startTransition(async () => {
      const result = await reopenProviderTicketAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket de proveedor reabierto");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: Filters + New button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Provider filter */}
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los proveedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proveedores</SelectItem>
              {providerOptions.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(PROVIDER_TICKET_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setEditingTicket(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo ticket de proveedor
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código externo</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha requerimiento</TableHead>
              <TableHead>Registrado por</TableHead>
              <TableHead>Ticket vinculado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  {providerTickets.length === 0
                    ? "No hay tickets de proveedores registrados."
                    : "No hay tickets que coincidan con los filtros."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">{ticket.externalCode}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {ticket.title}
                  </TableCell>
                  <TableCell>{ticket.provider.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status as ProviderTicketStatus} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell>{formatDateShort(ticket.requestDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <UserAvatar
                        name={ticket.requestedBy.name}
                        image={ticket.requestedBy.image}
                        size="sm"
                      />
                      <span className="text-sm truncate max-w-[100px]" title={ticket.requestedBy.name}>
                        {ticket.requestedBy.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ticket.ticket ? (
                      <Link
                        href={`/dashboard/tickets/${ticket.ticket.ticketCode}`}
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {ticket.ticket.ticketCode}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTicket(ticket);
                          setIsDialogOpen(true);
                        }}
                        disabled={isPending}
                        aria-label={`Editar ${ticket.externalCode}`}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Close / Reopen */}
                      {ticket.status === "en_proceso" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setClosingTicket(ticket)}
                          disabled={isPending}
                          aria-label={`Cerrar ${ticket.externalCode}`}
                          title="Cerrar ticket"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReopen(ticket.id)}
                          disabled={isPending}
                          aria-label={`Reabrir ${ticket.externalCode}`}
                          title="Reabrir ticket"
                        >
                          <RotateCcw className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(ticket.id)}
                        disabled={isPending}
                        aria-label={`Eliminar ${ticket.externalCode}`}
                        title="Eliminar"
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

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredTickets.length} de {providerTickets.length} ticket{providerTickets.length !== 1 ? "s" : ""} de proveedor{providerTickets.length !== 1 ? "es" : ""}
      </p>

      {/* Create/Edit Dialog — key forces re-mount so state resets properly */}
      <ProviderTicketDialog
        key={editingTicket?.id ?? "new"}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ticket={editingTicket}
        providers={providers}
        areaTickets={areaTickets}
      />

      {/* Close Dialog */}
      <CloseProviderTicketDialog
        key={`close-${closingTicket?.id ?? "none"}`}
        open={closingTicket !== null}
        onOpenChange={(open) => !open && setClosingTicket(null)}
        ticket={closingTicket}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar ticket de proveedor?"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente el ticket de proveedor."
      />
    </div>
  );
}

// --- Status Badge ---

function StatusBadge({ status }: { status: ProviderTicketStatus }) {
  const label = PROVIDER_TICKET_STATUS_LABELS[status] || status;
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        status === "en_proceso"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      )}
    >
      {label}
    </div>
  );
}

// --- Priority Badge ---

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  const label = PROVIDER_TICKET_PRIORITY_LABELS[priority as ProviderTicketPriority] || priority;
  const style = PROVIDER_TICKET_PRIORITY_STYLES[priority as ProviderTicketPriority] || "";
  return (
    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", style)}>
      {label}
    </div>
  );
}

// --- Ticket Combobox (searchable by code or title) ---

function TicketCombobox({
  tickets,
  value,
  onChange,
}: {
  tickets: AreaTicket[];
  value: number | null;
  onChange: (ticketId: number | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal text-sm",
            !value && "text-muted-foreground"
          )}
        >
          {selectedTicket
            ? `${selectedTicket.ticketCode} — ${selectedTicket.title.length > 30 ? selectedTicket.title.slice(0, 30) + "…" : selectedTicket.title}`
            : "Buscar ticket por código o título..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar ticket..." />
          <CommandList>
            <CommandEmpty>No se encontraron tickets.</CommandEmpty>
            <CommandGroup>
              {/* Option to clear selection */}
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                <span className="text-muted-foreground">Sin ticket vinculado</span>
              </CommandItem>
              {tickets.map((ticket) => (
                <CommandItem
                  key={ticket.id}
                  value={`${ticket.ticketCode} ${ticket.title}`}
                  onSelect={() => {
                    onChange(ticket.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === ticket.id ? "opacity-100" : "opacity-0")}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">{ticket.ticketCode}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[320px]">
                      {ticket.title}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- Close Provider Ticket Dialog (completionDate obligatorio + encuesta opcional) ---

const PROVIDER_SURVEY_QUESTIONS = [
  { key: "responseTimeRating", label: "Tiempo de respuesta del proveedor" },
  { key: "deadlineRating", label: "Cumplimiento de plazos acordados" },
  { key: "qualityRating", label: "Calidad del entregable / solución" },
  { key: "requirementUnderstandingRating", label: "Comprensión del requerimiento" },
  { key: "attentionRating", label: "Atención y comunicación del proveedor" },
] as const;

type ProviderSurveyKey = typeof PROVIDER_SURVEY_QUESTIONS[number]["key"];

const RATING_STYLES: Record<number, string> = {
  1: "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30",
  2: "border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30",
  3: "border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-950/30",
  4: "border-lime-300 text-lime-700 hover:bg-lime-50 dark:border-lime-700 dark:text-lime-400 dark:hover:bg-lime-950/30",
  5: "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30",
};

const RATING_SELECTED_STYLES: Record<number, string> = {
  1: "bg-red-100 border-red-500 text-red-700 dark:bg-red-950/50 dark:border-red-500 dark:text-red-300",
  2: "bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-950/50 dark:border-orange-500 dark:text-orange-300",
  3: "bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-950/50 dark:border-yellow-500 dark:text-yellow-300",
  4: "bg-lime-100 border-lime-500 text-lime-700 dark:bg-lime-950/50 dark:border-lime-500 dark:text-lime-300",
  5: "bg-green-100 border-green-500 text-green-700 dark:bg-green-950/50 dark:border-green-500 dark:text-green-300",
};

function CloseProviderTicketDialog({
  open,
  onOpenChange,
  ticket,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: ProviderTicketRow | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completionDate, setCompletionDate] = useState<string>("");
  const [includeSurvey, setIncludeSurvey] = useState(false);
  const [ratings, setRatings] = useState<Partial<Record<ProviderSurveyKey, number>>>({});
  const [observations, setObservations] = useState("");

  function resetForm() {
    setCompletionDate("");
    setIncludeSurvey(false);
    setRatings({});
    setObservations("");
  }

  const allRatingsFilled = includeSurvey
    ? PROVIDER_SURVEY_QUESTIONS.every((q) => ratings[q.key] !== undefined)
    : true;

  function handleClose() {
    if (!ticket) return;
    if (!completionDate) {
      toast.error("Selecciona la fecha de atención para cerrar el ticket");
      return;
    }
    if (includeSurvey && !allRatingsFilled) {
      toast.error("Completa todas las calificaciones antes de cerrar");
      return;
    }

    const formData = new FormData();
    formData.set("id", ticket.id.toString());
    formData.set("completionDate", completionDate);

    if (includeSurvey && allRatingsFilled) {
      PROVIDER_SURVEY_QUESTIONS.forEach((q) => {
        formData.set(q.key, ratings[q.key]!.toString());
      });
      if (observations.trim()) {
        formData.set("observations", observations.trim());
      }
    }

    startTransition(async () => {
      const result = await closeProviderTicketAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          includeSurvey && allRatingsFilled
            ? "Ticket cerrado y evaluación registrada"
            : "Ticket de proveedor cerrado"
        );
        onOpenChange(false);
        resetForm();
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cerrar ticket de proveedor</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Vas a cerrar "${ticket.externalCode}". Indica la fecha de atención y, opcionalmente, evalúa al proveedor.`
              : "Indica la fecha de atención para cerrar el ticket."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Fecha de atención */}
          <div className="grid gap-2">
            <Label>Fecha de atención <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm",
                    !completionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {completionDate
                    ? dayjs(completionDate).format("D [de] MMMM [de] YYYY")
                    : "Selecciona la fecha de atención"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={completionDate ? new Date(completionDate + "T00:00:00") : undefined}
                  onSelect={(date) => {
                    setCompletionDate(date ? dayjs(date).format("YYYY-MM-DD") : "");
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Fecha en la que el proveedor atendió el requerimiento.
            </p>
          </div>

          {/* Toggle para encuesta */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setIncludeSurvey((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">⭐</span>
                Evaluar al proveedor
                <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
              </span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium transition-colors",
                includeSurvey
                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {includeSurvey ? "Activada" : "Omitir"}
              </span>
            </button>

            {includeSurvey && (
              <div className="px-4 py-4 space-y-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Califica del 1 (muy malo) al 5 (excelente) el desempeño del proveedor.
                </p>

                {PROVIDER_SURVEY_QUESTIONS.map((q) => (
                  <div key={q.key} className="space-y-1.5">
                    <Label className="text-xs font-medium">{q.label}</Label>
                    <div className="flex gap-1.5">
                      {([1, 2, 3, 4, 5] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={isPending}
                          onClick={() => setRatings((prev) => ({ ...prev, [q.key]: val }))}
                          className={cn(
                            "h-9 w-9 rounded-lg border text-sm font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            ratings[q.key] === val
                              ? RATING_SELECTED_STYLES[val]
                              : RATING_STYLES[val]
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Observaciones */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Observaciones <span className="font-normal text-muted-foreground">(opcional)</span>
                  </Label>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Comentarios adicionales sobre el desempeño del proveedor..."
                    rows={2}
                    maxLength={1000}
                    className="resize-none text-sm"
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleClose}
            disabled={isPending || !completionDate || (includeSurvey && !allRatingsFilled)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {includeSurvey ? "Cerrar y evaluar" : "Cerrar ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- Create/Edit Dialog ---

function ProviderTicketDialog({
  open,
  onOpenChange,
  ticket,
  providers,
  areaTickets,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: ProviderTicketRow | null;
  providers: Provider[];
  areaTickets: AreaTicket[];
}) {
  const [isPending, startTransition] = useTransition();

  // State for date picker and ticket combobox
  // Because we use key={ticket?.id ?? "new"} on this component,
  // these initial values are always correct on mount.
  const [requestDate, setRequestDate] = useState<string>(ticket?.requestDate || "");
  const [linkedTicketId, setLinkedTicketId] = useState<number | null>(ticket?.ticketId ?? null);
  const [priority, setPriority] = useState<string>(ticket?.priority || "");

  async function handleSubmit(formData: FormData) {
    // Append calendar-managed fields
    formData.set("requestDate", requestDate);
    // Append combobox-managed field
    if (linkedTicketId) {
      formData.set("ticketId", linkedTicketId.toString());
    } else {
      formData.delete("ticketId");
    }
    // Append priority
    if (priority && priority !== "none") {
      formData.set("priority", priority);
    } else {
      formData.delete("priority");
    }

    startTransition(async () => {
      if (ticket) {
        formData.append("id", ticket.id.toString());
        // Preserve current status and completionDate when editing
        formData.set("status", ticket.status);
        if (ticket.completionDate) {
          formData.set("completionDate", ticket.completionDate);
        }
        const result = await updateProviderTicketAction(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Ticket de proveedor actualizado");
          onOpenChange(false);
        }
      } else {
        const result = await createProviderTicketAction(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Ticket de proveedor creado");
          onOpenChange(false);
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ticket ? "Editar ticket de proveedor" : "Nuevo ticket de proveedor"}
          </DialogTitle>
          <DialogDescription>
            {ticket
              ? "Modifica los datos del ticket de proveedor."
              : "Registra un nuevo ticket de proveedor externo."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {/* External Code */}
          <div className="grid gap-2">
            <Label htmlFor="externalCode">Código externo</Label>
            <Input
              id="externalCode"
              name="externalCode"
              defaultValue={ticket?.externalCode}
              required
              placeholder="Ej: TK-2026-001"
            />
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={ticket?.title}
              required
              placeholder="Descripción breve del requerimiento"
            />
          </div>

          {/* Provider */}
          <div className="grid gap-2">
            <Label htmlFor="providerId">Proveedor</Label>
            <select
              id="providerId"
              name="providerId"
              defaultValue={ticket?.providerId?.toString() || ""}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="" disabled>
                Selecciona un proveedor
              </option>
              {providers.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Request Date */}
          <div className="grid gap-2">
            <Label>Fecha de requerimiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm",
                    !requestDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {requestDate
                    ? dayjs(requestDate).format("D [de] MMMM [de] YYYY")
                    : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={requestDate ? new Date(requestDate + "T00:00:00") : undefined}
                  onSelect={(date) => {
                    setRequestDate(date ? dayjs(date).format("YYYY-MM-DD") : "");
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={ticket?.description}
              required
              placeholder="Detalle del requerimiento al proveedor"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="grid gap-2">
            <Label>
              Prioridad <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin prioridad</SelectItem>
                {Object.entries(PROVIDER_TICKET_PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linked Ticket (searchable combobox) */}
          <div className="grid gap-2">
            <Label>
              Ticket vinculado <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <TicketCombobox
              tickets={areaTickets}
              value={linkedTicketId}
              onChange={setLinkedTicketId}
            />
            <p className="text-xs text-muted-foreground">
              Busca por código o título del ticket del sistema.
            </p>
          </div>

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

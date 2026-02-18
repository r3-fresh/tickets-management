
import { db } from "@/db";
import { tickets, comments, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, translatePriority, formatFileSize } from "@/lib/utils/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import {
    FileIcon, ImageIcon, FileTextIcon, FileSpreadsheetIcon, FilmIcon, ExternalLinkIcon, PaperclipIcon,
    MessageSquareIcon, FileText, ChevronDown, Monitor, User, Clock, Calendar, Hash, Tag, ArrowRight, Eye
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AdminTicketControls } from "./admin-ticket-controls";
import { MarkAsViewed } from "./mark-as-viewed";
import { WatchersManager } from "./watchers-manager";
import { CancelTicketButton } from "./cancel-ticket-button";
import { CopyTicketButton } from "./copy-ticket-button";
import { UserValidationControls } from "./user-validation-controls";
import { CommentForm } from "./comment-form";
import { TicketAttachmentUploader } from "./ticket-attachment-uploader";
import { DeleteAttachmentButton } from "./delete-attachment-button";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

// Client Components for interactivity
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* --- Helper Components --- */

function AttachmentIcon({ mimeType }: { mimeType: string }) {
    const className = "h-4 w-4 text-muted-foreground shrink-0";
    if (mimeType.startsWith("image/")) return <ImageIcon className={className} />;
    if (mimeType.startsWith("video/")) return <FilmIcon className={className} />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
        return <FileSpreadsheetIcon className={className} />;
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text/"))
        return <FileTextIcon className={className} />;
    return <FileIcon className={className} />;
}

const RichTextEditor = dynamic(
    () => import("@/components/shared/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })),
    { loading: () => <div className="h-24 animate-pulse rounded-md bg-muted" /> }
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const ticketId = Number(id);
    if (isNaN(ticketId)) return { title: "Ticket no encontrado" };

    const ticket = await db.query.tickets.findFirst({
        where: eq(tickets.id, ticketId),
        columns: { ticketCode: true, title: true },
    });

    if (!ticket) return { title: "Ticket no encontrado" };

    return { title: `${ticket.ticketCode} - ${ticket.title}` };
}

/* --- Main Page Component --- */

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await requireAuth();
    const { id } = await params;
    const ticketId = Number(id);

    if (isNaN(ticketId)) notFound();

    const ticket = await db.query.tickets.findFirst({
        where: eq(tickets.id, ticketId),
        with: {
            createdBy: true,
            category: true,
            subcategory: true,
            campus: true,
            area: true,
            attentionArea: true,
            assignedTo: true,
            attachments: {
                with: { uploadedBy: true },
                orderBy: (a, { asc }) => [asc(a.createdAt)],
            },
            comments: {
                with: { author: true },
                orderBy: [desc(comments.createdAt)]
            }
        }
    });

    if (!ticket) notFound();

    // Permissions
    const isCreator = ticket.createdById === session.user.id;
    const isWatcher = ticket.watchers?.includes(session.user.id) || false;
    const isAdmin = session.user.role === "admin";
    const isAgentForArea = session.user.role === "agent" && session.user.attentionAreaId === ticket.attentionAreaId;

    if (!isCreator && !isWatcher && !isAdmin && !isAgentForArea) {
        redirect("/dashboard");
    }

    // Data prep
    const allUsers = await db.select({
        id: users.id, name: users.name, email: users.email, image: users.image,
    }).from(users);

    const watchersList = ticket.watchers?.length
        ? allUsers.filter(u => ticket.watchers!.includes(u.id))
        : [];

    const isTicketClosed = ticket.status === 'resolved' || ticket.status === 'voided';
    const canComment = !isTicketClosed;

    return (
        <div className="mx-auto max-w-[1600px] space-y-8 pb-20 animate-in fade-in duration-500">
            <MarkAsViewed ticketId={ticketId} />

            {/* Top Navigation */}
            <div>
                <Breadcrumb items={[{ label: ticket.ticketCode }]} />
            </div>

            {/* Validation Controls */}
            {ticket.status === 'pending_validation' && ticket.createdById === session.user.id && (
                <UserValidationControls ticketId={ticket.id} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

                {/* LEFT COLUMN: Main Content */}
                <div className="min-w-0 space-y-8">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
                                {ticket.title}
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <StatusBadge status={ticket.status} />
                                <PriorityBadge priority={ticket.priority} />
                                <CopyTicketButton ticketCode={ticket.ticketCode} title={ticket.title} />
                            </div>
                            <span className="flex items-center gap-1.5 font-mono text-xs bg-muted/50 px-2 py-0.5 rounded border">
                                <Hash className="w-3 h-3 text-muted-foreground/70" />
                                {ticket.ticketCode}
                            </span>
                            <span className="flex items-center gap-2">
                                <UserAvatar name={ticket.createdBy.name} image={ticket.createdBy.image} size="xs" />
                                <span className="text-foreground font-medium">{ticket.createdBy.name}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground/80">
                                <Calendar className="w-3.5 h-3.5 opacity-70" />
                                <span className="font-medium text-muted-foreground">Creado el:</span> {formatDate(ticket.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Main Content - Description & Attachments */}
                    <div className="ml-1">

                        <div className="rounded-xl border border-border bg-card">
                            <div className="px-6 pt-5 pb-4">
                                <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                                    Descripción
                                </h3>
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <RichTextEditor
                                        value={ticket.description}
                                        disabled={true}
                                        className="border-0 px-0 bg-transparent min-h-0 shadow-none focus-within:ring-0 text-sm leading-relaxed"
                                    />
                                </div>
                            </div>
                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <>
                                    <div className="mx-6 border-t border-border" />
                                    <div className="px-6 pt-4 pb-6 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <PaperclipIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            <p className="text-sm font-medium">Archivos adjuntos</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {ticket.attachments.map((file) => {
                                                const canDelete = isAdmin || isAgentForArea || file.uploadedById === session.user.id;
                                                return (
                                                    <div
                                                        key={file.id}
                                                        className="group flex items-start p-3 rounded-lg border bg-background/50 hover:bg-accent/50 hover:border-accent-foreground/20 transition-all relative overflow-hidden"
                                                    >
                                                        {/* Main Content (Clickable) */}
                                                        <a
                                                            href={file.driveViewLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 flex-1 min-w-0 focus:outline-hidden"
                                                        >
                                                            <div className="bg-muted p-2.5 rounded-md shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                                                                <AttachmentIcon mimeType={file.mimeType} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate group-hover:underline decoration-muted-foreground/50 underline-offset-4 text-foreground">
                                                                    {file.fileName}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatFileSize(file.fileSize)}
                                                                </p>
                                                                {file.uploadedBy && (
                                                                    <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">
                                                                        Por <span className="font-medium">{file.uploadedBy.name}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </a>

                                                        {/* Actions Column */}
                                                        <div className="flex flex-col gap-1 pl-2 ml-2 border-l border-border/40 justify-center min-h-[40px]">
                                                            {canDelete && (
                                                                <DeleteAttachmentButton
                                                                    attachmentId={file.id}
                                                                    ticketId={ticketId}
                                                                    fileName={file.fileName}
                                                                />
                                                            )}
                                                            <a
                                                                href={file.driveViewLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                                                title="Ver documento"
                                                            >
                                                                <ExternalLinkIcon className="h-3.5 w-3.5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>


                    </div>


                    {/* Activity / Comments */}
                    <div className="space-y-6 pt-4">
                        <Collapsible defaultOpen className="space-y-6">
                            <div className="flex items-center justify-between">
                                <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors group cursor-pointer">
                                    <MessageSquareIcon className="w-3.5 h-3.5" />
                                    Comentarios
                                    <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{ticket.comments.length}</span>
                            </div>

                            <CollapsibleContent>
                                {/* Comment Form (Top) */}
                                {canComment && (
                                    <div className="pb-8 pl-2">
                                        <CommentForm ticketId={ticketId} />
                                    </div>
                                )}

                                {/* Timeline */}
                                <div className="space-y-8 relative pl-2">
                                    {/* Line connector */}
                                    {ticket.comments.length > 0 && (
                                        <div className="absolute left-[26px] top-4 bottom-4 w-px bg-linear-to-b from-border/80 via-border/40 to-transparent" />
                                    )}

                                    {ticket.comments.map((comment) => (
                                        <div key={comment.id} className="relative pl-12 group">
                                            {/* Avatar */}
                                            <div className="absolute left-0 top-0 z-10">
                                                <UserAvatar
                                                    name={comment.author.name}
                                                    image={comment.author.image}
                                                    size="md"
                                                    className="ring-4 ring-background h-10 w-10 shadow-sm"
                                                />
                                            </div>

                                            {/* Comment Body */}
                                            <div className="space-y-2">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm font-semibold text-foreground">{comment.author.name}</span>
                                                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <div className="bg-sidebar border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground shadow-sm group-hover:border-border/80 transition-colors">
                                                    <RichTextEditor
                                                        value={comment.content}
                                                        disabled={true}
                                                        className="border-0 px-0 bg-transparent min-h-0 p-0 shadow-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Empty State */}
                        {ticket.comments.length === 0 && (
                            <div className="text-center py-12 px-4 border border-dashed rounded-lg bg-muted/5">
                                <div className="mx-auto h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                                    <MessageSquareIcon className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-sm font-medium text-foreground">Sin comentarios aún</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                                    Inicia la conversación preguntando detalles o añadiendo actualizaciones.
                                </p>
                            </div>
                        )}

                        {/* Comment Form */}
                        {!canComment && (
                            <div className="bg-muted/30 border rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                                <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                                Este ticket ha sido cerrado.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Context Sidebar */}
                <div className="space-y-8 sticky top-6 lg:border-l lg:pl-10 border-border/60">

                    {/* Ticket Details */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" />
                                Detalles
                            </h3>

                            {/* Assigned To */}
                            <div className="bg-sidebar border border-border/50 rounded-xl p-4 group">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                                    <User className="w-3 h-3" />
                                    Responsable
                                </label>
                                {ticket.assignedTo ? (
                                    <div className="flex items-center gap-2.5 rounded-md transition-colors cursor-default">
                                        <UserAvatar name={ticket.assignedTo.name} image={ticket.assignedTo.image} size="xs" className="h-6 w-6" />
                                        <span className="text-sm font-medium text-foreground">{ticket.assignedTo.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic">Sin asignar</div>
                                )}
                            </div>
                        </div>

                        {/* Attributes Grid */}
                        <div className="bg-sidebar border border-border/50 rounded-xl p-4 grid grid-cols-1 gap-y-4">
                            <div>
                                <label className="text-[11px] font-medium text-muted-foreground uppercase block mb-1">Categoría</label>
                                <div className="text-sm font-medium text-foreground">{ticket.category?.name || "—"}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{ticket.subcategory?.name}</div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase block mb-1">Campus</label>
                                    <div className="text-sm text-foreground">{ticket.campus?.name || "—"}</div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase block mb-1">Área</label>
                                    <div className="text-sm text-foreground">{ticket.attentionArea?.name || "—"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Watchers */}
                        <div className="bg-sidebar border border-border/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                                    <Eye className="w-3 h-3" />
                                    Usuarios notificados
                                </label>
                                {!isTicketClosed && (
                                    <WatchersManager
                                        ticketId={ticketId}
                                        currentWatchers={ticket.watchers || []}
                                        currentUserId={session.user.id}
                                        allUsers={allUsers}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                {watchersList.length > 0 ? watchersList.map(watcher => (
                                    <div key={watcher.id} className="flex items-center gap-2 text-sm" title={watcher.email}>
                                        <UserAvatar name={watcher.name} image={watcher.image} size="xs" className="h-6 w-6" />
                                        <span className="text-foreground/90 font-medium truncate">{watcher.name}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground/60 italic">No hay usuarios notificados</p>
                                )}
                            </div>
                        </div>

                        {/* Attachment Uploader — only for open tickets */}
                        {!isTicketClosed && (
                            <div className="mb-4">
                                <TicketAttachmentUploader ticketId={ticketId} />
                            </div>
                        )}

                        {/* Cancellation Action for Creator */}
                        {isCreator && !isTicketClosed && (
                            <>
                                <div>
                                    <CancelTicketButton ticketId={ticketId} />
                                </div>
                            </>
                        )}

                        {/* Closure Info (if applicable) */}
                        {ticket.status === 'resolved' && ticket.closedBy && (
                            <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 mt-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">Resuelto</span>
                                </div>
                                <p className="text-xs text-green-600/80 dark:text-green-500/80">
                                    Cerrado por {ticket.closedBy === 'user' ? 'Usuario' : ticket.closedBy === 'admin' ? 'Admin' : 'Sistema'} el {formatDate(ticket.closedAt!)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Admin Controls */}
                    {(isAdmin || isAgentForArea) && (
                        <div className="space-y-3 pt-2">
                            <div className="rounded-lg border border-orange-200 dark:border-orange-900 bg-linear-to-b from-orange-50/50 to-orange-50/10 dark:from-orange-950/20 dark:to-transparent overflow-hidden">
                                <div className="px-3 py-2 border-b border-orange-100 dark:border-orange-900/50 flex items-center gap-2 bg-orange-100/30 dark:bg-orange-950/30">
                                    <Monitor className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Gestión del Ticket</span>
                                </div>
                                <div className="p-3">
                                    <AdminTicketControls
                                        ticketId={ticketId}
                                        currentStatus={ticket.status}
                                        isAssigned={!!ticket.assignedToId}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}

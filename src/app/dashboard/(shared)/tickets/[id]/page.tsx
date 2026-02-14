
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
    MessageSquareIcon, FileText, ChevronDown, Monitor, User
} from "lucide-react";
import { AdminTicketControls } from "./admin-ticket-controls";
import { MarkAsViewed } from "./mark-as-viewed";
import { WatchersManager } from "./watchers-manager";
import { CancelTicketButton } from "./cancel-ticket-button";
import { CopyTicketButton } from "./copy-ticket-button";
import { UserValidationControls } from "./user-validation-controls";
import { CommentForm } from "./comment-form";
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
            attachments: true,
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
        <div className="mx-auto max-w-6xl space-y-6 pb-20">
            <MarkAsViewed ticketId={ticketId} />
            <Breadcrumb items={[{ label: ticket.ticketCode }]} />

            {/* Notification Banner */}
            {ticket.status === 'pending_validation' && ticket.createdById === session.user.id && (
                <UserValidationControls ticketId={ticket.id} />
            )}

            {/* HEADER: Title & Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 flex-1">
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono text-muted-foreground border">
                            {ticket.ticketCode}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>

                    {/* Title Row */}
                    <div className="flex items-start gap-3 group">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight md:text-3xl">
                            {ticket.title}
                        </h1>
                        <CopyTicketButton ticketCode={ticket.ticketCode} title={ticket.title} />
                    </div>

                    {/* Author Row */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserAvatar name={ticket.createdBy.name} image={ticket.createdBy.image} size="xs" />
                        <span className="font-medium text-foreground">{ticket.createdBy.name}</span>
                        <span>creó esto el {formatDate(ticket.createdAt)}</span>
                    </div>
                </div>

                {/* Top Actions */}
                {isCreator && !isTicketClosed && (
                    <CancelTicketButton ticketId={ticketId} />
                )}
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">

                {/* LEFT COLUMN: Main Content */}
                <div className="space-y-8 min-w-0">

                    {/* 1. DESCRIPTION (Collapsible, open default) */}
                    <Collapsible defaultOpen className="group/desc">
                        <div className="flex items-center justify-between mb-2">
                            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]/desc:-rotate-90" />
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Descripción
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <RichTextEditor value={ticket.description} disabled={true} />
                                    </div>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 2. TECHNICAL DETAILS (Collapsible, closed default) */}
                    <Collapsible className="group/tech">
                        <div className="flex items-center justify-between mb-2">
                            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]/tech:-rotate-90" />
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                Detalles Técnicos
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            <Card>
                                <CardContent className="pt-6">
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {[
                                            { label: "Categoría", value: ticket.category?.name },
                                            { label: "Subcategoría", value: ticket.subcategory?.name },
                                            { label: "Campus", value: ticket.campus?.name },
                                            { label: "Área Origen", value: ticket.area?.name },
                                            { label: "Área Destino", value: ticket.attentionArea?.name },
                                            { label: "Prioridad", value: translatePriority(ticket.priority) },
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col">
                                                <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
                                                <dd className="text-sm font-medium mt-0.5">{item.value || "—"}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 3. ATTACHMENTS (Visible if present) */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                                <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                                Archivos Adjuntos ({ticket.attachments.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ticket.attachments.map((file) => (
                                    <a
                                        key={file.id}
                                        href={file.driveViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                                    >
                                        <div className="bg-muted p-2 rounded shrink-0">
                                            <AttachmentIcon mimeType={file.mimeType} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-sm font-medium truncate group-hover:underline decoration-muted-foreground/50 underline-offset-4">
                                                {file.fileName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                                        </div>
                                        <ExternalLinkIcon className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* 4. COMMENTS (Collapsible, open default) */}
                    <Collapsible defaultOpen className="group/comments">
                        <div className="flex items-center justify-between mb-4">
                            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]/comments:-rotate-90" />
                                <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                                Comentarios ({ticket.comments.length})
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent>
                            <div className="space-y-8 pl-2">
                                {/* Timeline */}
                                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-border/60">
                                    {ticket.comments.map((comment) => (
                                        <div key={comment.id} className="relative pl-12">
                                            {/* Avatar node on timeline */}
                                            <div className="absolute left-0 top-0">
                                                <UserAvatar
                                                    name={comment.author.name}
                                                    image={comment.author.image}
                                                    size="md"
                                                    className="ring-4 ring-background h-10 w-10 relative z-10"
                                                />
                                            </div>

                                            {/* Comment Content */}
                                            <div className="space-y-2">
                                                <div className="flex items-baseline justify-between">
                                                    <span className="text-sm font-semibold">{comment.author.name}</span>
                                                    <time className="text-xs text-muted-foreground">
                                                        {formatDate(comment.createdAt)}
                                                    </time>
                                                </div>
                                                <div className="bg-muted/30 border rounded-lg px-4 py-3 text-sm">
                                                    <RichTextEditor value={comment.content} disabled={true} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* No comments state */}
                                {ticket.comments.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                                        <MessageSquareIcon className="h-8 w-8 opacity-20 mb-2" />
                                        <p className="text-sm">No hay comentarios aún</p>
                                    </div>
                                )}

                                {/* Comment Form */}
                                {canComment ? (
                                    <div className="pl-12 pt-4">
                                        <CommentForm ticketId={ticketId} />
                                    </div>
                                ) : (
                                    <div className="bg-muted/50 border rounded-lg p-4 text-center text-sm text-muted-foreground mx-12">
                                        Este ticket está cerrado y no admite más comentarios.
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* RIGHT COLUMN: Context Sidebar */}
                <div className="space-y-6">

                    {/* People Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b bg-muted/10">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                Personas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-5">
                            {/* Assigned To */}
                            <div>
                                <span className="text-xs font-medium text-muted-foreground mb-2 block">Asignado a</span>
                                {ticket.assignedTo ? (
                                    <div className="flex items-center gap-3">
                                        <UserAvatar name={ticket.assignedTo.name} image={ticket.assignedTo.image} size="sm" />
                                        <div className="text-sm font-medium">{ticket.assignedTo.name}</div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm italic">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-dashed">
                                            <User className="h-4 w-4 opacity-50" />
                                        </div>
                                        Sin asignar
                                    </div>
                                )}
                            </div>

                            {/* Watchers */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground">En seguimiento</span>
                                    {!isTicketClosed && (
                                        <WatchersManager
                                            ticketId={ticketId}
                                            currentWatchers={ticket.watchers || []}
                                            currentUserId={session.user.id}
                                            allUsers={allUsers}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {watchersList.length > 0 ? watchersList.map(watcher => (
                                        <div key={watcher.id} className="flex items-center gap-2">
                                            <UserAvatar name={watcher.name} image={watcher.image} size="xs" className="h-6 w-6" />
                                            <span className="text-sm">{watcher.name}</span>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-muted-foreground italic pl-1">Nadie sigue este ticket</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meta Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b bg-muted/10">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Monitor className="h-3.5 w-3.5" />
                                Contexto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Prioridad</span>
                                <PriorityBadge priority={ticket.priority} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Estado</span>
                                <span className="capitalize font-medium">{ticket.status.replace('_', ' ')}</span>
                            </div>
                            <Separator />
                            <div>
                                <span className="block text-xs text-muted-foreground mb-1">Área Destino</span>
                                <span className="font-medium text-right block truncate">{ticket.attentionArea?.name || "—"}</span>
                            </div>

                            {/* Closure Info */}
                            {ticket.status === 'resolved' && ticket.closedBy && (
                                <>
                                    <Separator />
                                    <div className="bg-green-500/10 -mx-4 -mb-4 p-4 border-t border-green-500/20">
                                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">CERRADO EL {formatDate(ticket.closedAt!)}</p>
                                        <p className="text-xs text-green-600/80 dark:text-green-500/80">
                                            Por: {ticket.closedBy === 'user' ? 'Usuario' : ticket.closedBy === 'admin' ? 'Admin' : 'Sistema'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Controls */}
                    {(isAdmin || isAgentForArea) && (
                        <Card className="border-orange-200 dark:border-orange-900 overflow-hidden">
                            <div className="bg-orange-50 dark:bg-orange-950/30 px-4 py-2 border-b border-orange-100 dark:border-orange-900">
                                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Zona Administrativa</span>
                            </div>
                            <CardContent className="pt-4">
                                <AdminTicketControls
                                    ticketId={ticketId}
                                    currentStatus={ticket.status}
                                    isAssigned={!!ticket.assignedToId}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

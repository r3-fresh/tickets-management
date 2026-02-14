
import { db } from "@/db";
import { tickets, comments, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, translatePriority, formatFileSize } from "@/lib/utils/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { FileIcon, ImageIcon, FileTextIcon, FileSpreadsheetIcon, FilmIcon, ExternalLinkIcon, PaperclipIcon, MessageSquareIcon } from "lucide-react";
import { AdminTicketControls } from "./admin-ticket-controls";
import { MarkAsViewed } from "./mark-as-viewed";
import { WatchersManager } from "./watchers-manager";
import { CancelTicketButton } from "./cancel-ticket-button";
import { UserValidationControls } from "./user-validation-controls";
import dynamic from "next/dynamic";
import { CommentForm } from "./comment-form";
import type { Metadata } from "next";

function AttachmentIcon({ mimeType }: { mimeType: string }) {
    const className = "h-5 w-5 text-muted-foreground shrink-0";
    if (mimeType.startsWith("image/")) return <ImageIcon className={className} />;
    if (mimeType.startsWith("video/")) return <FilmIcon className={className} />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
        return <FileSpreadsheetIcon className={className} />;
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text/"))
        return <FileTextIcon className={className} />;
    return <FileIcon className={className} />;
}

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

const RichTextEditor = dynamic(
    () => import("@/components/shared/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })),
    {
        loading: () => <div className="h-24 animate-pulse rounded-md bg-muted" />,
    }
);

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
                with: {
                    author: true
                },
                orderBy: [desc(comments.createdAt)]
            }
        }
    });

    if (!ticket) notFound();

    // Access control: Only creator, watchers, admins, or agents of the area can view
    const isCreator = ticket.createdById === session.user.id;
    const isWatcher = ticket.watchers?.includes(session.user.id) || false;
    const isAdmin = session.user.role === "admin";

    // Check if user is an agent for this specific area
    const isAgentForArea = session.user.role === "agent" &&
        session.user.attentionAreaId === ticket.attentionAreaId;

    if (!isCreator && !isWatcher && !isAdmin && !isAgentForArea) {
        redirect("/dashboard");
    }

    // Fetch only the columns needed for display
    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
    }).from(users);

    // Derive watchers from allUsers instead of a separate query
    const watchersList = ticket.watchers?.length
        ? allUsers.filter(u => ticket.watchers!.includes(u.id))
        : [];

    const isTicketClosed = ticket.status === 'resolved' || ticket.status === 'voided';
    const canComment = !isTicketClosed;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <MarkAsViewed ticketId={ticketId} />

            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: ticket.ticketCode }]} />

            {/* User Validation Controls - Only show for creators when pending validation */}
            {ticket.status === 'pending_validation' && ticket.createdById === session.user.id && (
                <UserValidationControls ticketId={ticket.id} />
            )}

            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{ticket.ticketCode}</span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">{ticket.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserAvatar name={ticket.createdBy.name} image={ticket.createdBy.image} size="sm" />
                        <span className="font-medium text-foreground">{ticket.createdBy.name}</span>
                        <span>·</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                </div>
                {isCreator && !isTicketClosed && (
                    <CancelTicketButton ticketId={ticketId} />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Description — Always visible */}
                    <div className="rounded-lg border bg-card">
                        <div className="px-5 py-3 border-b">
                            <h2 className="text-sm font-semibold">Descripción</h2>
                        </div>
                        <div className="px-5 py-4">
                            <div className="prose prose-sm max-w-none text-foreground">
                                <RichTextEditor value={ticket.description} disabled={true} />
                            </div>
                        </div>
                    </div>

                    {/* Technical Details — Compact grid */}
                    <div className="rounded-lg border bg-card">
                        <div className="px-5 py-3 border-b">
                            <h2 className="text-sm font-semibold text-muted-foreground">Detalles técnicos</h2>
                        </div>
                        <div className="px-5 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <span className="block text-[11px] text-muted-foreground mb-0.5">Categoría</span>
                                    <span className="font-medium">{ticket.category?.name || "—"}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground mb-0.5">Subcategoría</span>
                                    <span className="font-medium">{ticket.subcategory?.name || "—"}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground mb-0.5">Prioridad</span>
                                    <span className="font-medium capitalize">{translatePriority(ticket.priority)}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground mb-0.5">Área de Atención</span>
                                    <span className="font-medium">{ticket.attentionArea?.name || "—"}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground mb-0.5">Área de Procedencia</span>
                                    <span className="font-medium">{ticket.area?.name || "—"}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground mb-0.5">Campus</span>
                                    <span className="font-medium">{ticket.campus?.name || "—"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">
                                    Archivos adjuntos ({ticket.attachments.length})
                                </h3>
                            </div>
                            <div className="grid gap-2">
                                {ticket.attachments.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.driveViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5 hover:bg-muted/50 transition-colors group"
                                    >
                                        <AttachmentIcon mimeType={attachment.mimeType} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                            <p className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</p>
                                        </div>
                                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments Section — Timeline style */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">
                                Comentarios {ticket.comments.length > 0 && `(${ticket.comments.length})`}
                            </h3>
                        </div>

                        {/* Comment List — Timeline */}
                        {ticket.comments.length > 0 ? (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-[19px] top-5 bottom-5 w-px bg-border" aria-hidden />

                                <div className="space-y-5">
                                    {ticket.comments.map((comment) => (
                                        <div key={comment.id} className="relative flex gap-3">
                                            <Avatar className="h-10 w-10 shrink-0 relative z-10 ring-4 ring-background">
                                                <AvatarImage src={comment.author.image || undefined} />
                                                <AvatarFallback className="bg-muted-foreground/80 text-background font-bold text-xs">
                                                    {comment.author.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between mb-1 gap-2">
                                                    <p className="text-sm font-semibold">{comment.author.name}</p>
                                                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="rounded-lg bg-muted/30 border px-3 py-2">
                                                    <div className="text-sm text-foreground [&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5">
                                                        <RichTextEditor value={comment.content} disabled={true} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic py-2">Aún no hay comentarios.</p>
                        )}

                        {/* New Comment Form */}
                        {canComment ? (
                            <CommentForm ticketId={ticketId} />
                        ) : (
                            <div className="bg-muted/50 border rounded-lg p-4 text-center text-sm text-muted-foreground">
                                Este ticket está cerrado y no admite más comentarios.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Details */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold">Detalles del ticket</CardTitle>
                                {!isTicketClosed && (
                                    <WatchersManager
                                        ticketId={ticketId}
                                        currentWatchers={ticket.watchers || []}
                                        currentUserId={session.user.id}
                                        allUsers={allUsers}
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {/* Solicitante */}
                            <div>
                                <span className="block text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Solicitante</span>
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={ticket.createdBy.name} image={ticket.createdBy.image} size="md" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate text-sm">{ticket.createdBy.name}</span>
                                        <span className="text-xs text-muted-foreground truncate">{ticket.createdBy.email}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Asignado a */}
                            <div>
                                <span className="block text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Asignado a</span>
                                {ticket.assignedTo ? (
                                    <div className="flex items-center gap-2">
                                        <UserAvatar name={ticket.assignedTo.name} image={ticket.assignedTo.image} size="md" />
                                        <span className="font-medium">{ticket.assignedTo.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic text-xs">Sin asignar</span>
                                )}
                            </div>

                            <Separator />

                            {/* En seguimiento */}
                            <div>
                                <span className="block text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">En seguimiento</span>
                                {watchersList.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {watchersList.map(watcher => (
                                            <div key={watcher.id} className="flex items-center gap-1.5 bg-muted/50 rounded-full pl-0.5 pr-2 py-0.5">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={watcher.image || undefined} />
                                                    <AvatarFallback className="text-[10px]">{watcher.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs">{watcher.name.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic text-xs">Sin seguidores</span>
                                )}
                            </div>

                            <Separator />

                            {/* Prioridad */}
                            <div>
                                <span className="block text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Prioridad</span>
                                <PriorityBadge priority={ticket.priority} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin/Agent Controls */}
                    {(session.user.role === "admin" || isAgentForArea) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">Controles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <AdminTicketControls
                                    ticketId={ticketId}
                                    currentStatus={ticket.status}
                                    isAssigned={!!ticket.assignedToId}
                                />

                                {/* Closure Details - Only for closed tickets */}
                                {ticket.status === 'resolved' && ticket.closedBy && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">Detalles de Cierre</h4>
                                            <div className="space-y-1.5 text-sm text-muted-foreground">
                                                <div>
                                                    <span className="font-medium text-foreground">Cerrado por: </span>
                                                    {ticket.closedBy === 'user' && 'Usuario (Validado)'}
                                                    {ticket.closedBy === 'admin' && 'Administrador'}
                                                    {ticket.closedBy === 'system' && 'Sistema (Auto-cierre 48hrs)'}
                                                </div>
                                                {ticket.closedAt && (
                                                    <div>
                                                        <span className="font-medium text-foreground">Fecha de cierre: </span>
                                                        {formatDate(ticket.closedAt)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

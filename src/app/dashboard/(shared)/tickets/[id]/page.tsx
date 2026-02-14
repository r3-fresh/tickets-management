
import { db } from "@/db";
import { tickets, comments, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Separator } from "@/components/ui/separator";
import { formatDate, translatePriority } from "@/lib/utils/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { AdminTicketControls } from "./admin-ticket-controls";
import { MarkAsViewed } from "./mark-as-viewed";
import { WatchersManager } from "./watchers-manager";
import { CancelTicketButton } from "./cancel-ticket-button";
import { CopyTicketButton } from "./copy-ticket-button";
import { UserValidationControls } from "./user-validation-controls";
import { TicketTabs } from "./ticket-tabs";
import type { Metadata } from "next";

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

    // Access control
    const isCreator = ticket.createdById === session.user.id;
    const isWatcher = ticket.watchers?.includes(session.user.id) || false;
    const isAdmin = session.user.role === "admin";
    const isAgentForArea = session.user.role === "agent" &&
        session.user.attentionAreaId === ticket.attentionAreaId;

    if (!isCreator && !isWatcher && !isAdmin && !isAgentForArea) {
        redirect("/dashboard");
    }

    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
    }).from(users);

    const watchersList = ticket.watchers?.length
        ? allUsers.filter(u => ticket.watchers!.includes(u.id))
        : [];

    const isTicketClosed = ticket.status === 'resolved' || ticket.status === 'voided';
    const canComment = !isTicketClosed;

    return (
        <div className="space-y-5 max-w-6xl mx-auto">
            <MarkAsViewed ticketId={ticketId} />

            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: ticket.ticketCode }]} />

            {/* Validation banner */}
            {ticket.status === 'pending_validation' && ticket.createdById === session.user.id && (
                <UserValidationControls ticketId={ticket.id} />
            )}

            {/* ─── HEADER ─── */}
            <header>
                {/* Row 1: Code + badges + actions */}
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            {ticket.ticketCode}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>
                    {isCreator && !isTicketClosed && (
                        <CancelTicketButton ticketId={ticketId} />
                    )}
                </div>

                {/* Row 2: Title + copy */}
                <div className="flex items-start gap-2 mb-2">
                    <h1 className="text-xl font-bold tracking-tight leading-tight">
                        {ticket.title}
                    </h1>
                    <CopyTicketButton ticketCode={ticket.ticketCode} title={ticket.title} />
                </div>

                {/* Row 3: Meta chips */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <UserAvatar name={ticket.createdBy.name} image={ticket.createdBy.image} size="sm" />
                        <span className="font-medium text-foreground">{ticket.createdBy.name}</span>
                    </div>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    {ticket.category && (
                        <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">
                                {ticket.category.name}
                                {ticket.subcategory && ` / ${ticket.subcategory.name}`}
                            </span>
                        </>
                    )}
                    {ticket.campus && (
                        <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-xs">{ticket.campus.name}</span>
                        </>
                    )}
                </div>
            </header>

            <Separator />

            {/* ─── BODY: 2 columns ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

                {/* LEFT: Tabbed content */}
                <div className="min-w-0">
                    <TicketTabs
                        description={ticket.description}
                        comments={ticket.comments.map(c => ({
                            id: c.id,
                            content: c.content,
                            createdAt: c.createdAt,
                            author: {
                                name: c.author.name,
                                image: c.author.image,
                            }
                        }))}
                        attachments={(ticket.attachments || []).map(a => ({
                            id: a.id,
                            fileName: a.fileName,
                            mimeType: a.mimeType,
                            fileSize: a.fileSize,
                            driveViewLink: a.driveViewLink,
                        }))}
                        ticketId={ticketId}
                        canComment={canComment}
                        formatDate={formatDate}
                    />
                </div>

                {/* RIGHT: Sidebar */}
                <aside className="space-y-5">
                    {/* People section */}
                    <div className="space-y-4">
                        {/* Asignado */}
                        <div>
                            <span className="block text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">
                                Asignado a
                            </span>
                            {ticket.assignedTo ? (
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={ticket.assignedTo.name} image={ticket.assignedTo.image} size="md" />
                                    <div className="min-w-0">
                                        <span className="block text-sm font-medium truncate">{ticket.assignedTo.name}</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                            )}
                        </div>

                        <Separator />

                        {/* En seguimiento */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    En seguimiento
                                </span>
                                {!isTicketClosed && (
                                    <WatchersManager
                                        ticketId={ticketId}
                                        currentWatchers={ticket.watchers || []}
                                        currentUserId={session.user.id}
                                        allUsers={allUsers}
                                    />
                                )}
                            </div>
                            {watchersList.length > 0 ? (
                                <div className="space-y-1.5">
                                    {watchersList.map(watcher => (
                                        <div key={watcher.id} className="flex items-center gap-2">
                                            <UserAvatar name={watcher.name} image={watcher.image} size="sm" />
                                            <span className="text-sm truncate">{watcher.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground italic">Sin seguidores</span>
                            )}
                        </div>

                        <Separator />

                        {/* Metadata */}
                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">Prioridad</span>
                                <PriorityBadge priority={ticket.priority} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">Área destino</span>
                                <span className="text-xs font-medium text-right max-w-[160px] truncate">
                                    {ticket.attentionArea?.name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">Área origen</span>
                                <span className="text-xs font-medium text-right max-w-[160px] truncate">
                                    {ticket.area?.name || "—"}
                                </span>
                            </div>
                        </div>

                        {/* Closure details */}
                        {ticket.status === 'resolved' && ticket.closedBy && (
                            <>
                                <Separator />
                                <div className="space-y-1.5 text-sm">
                                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                                        Cierre
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Por: </span>
                                        {ticket.closedBy === 'user' && 'Usuario (Validado)'}
                                        {ticket.closedBy === 'admin' && 'Administrador'}
                                        {ticket.closedBy === 'system' && 'Sistema (Auto-cierre)'}
                                    </div>
                                    {ticket.closedAt && (
                                        <div className="text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">Fecha: </span>
                                            {formatDate(ticket.closedAt)}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Admin Controls */}
                    {(session.user.role === "admin" || isAgentForArea) && (
                        <>
                            <Separator />
                            <div>
                                <span className="block text-[10px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                                    Controles
                                </span>
                                <AdminTicketControls
                                    ticketId={ticketId}
                                    currentStatus={ticket.status}
                                    isAssigned={!!ticket.assignedToId}
                                />
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
}

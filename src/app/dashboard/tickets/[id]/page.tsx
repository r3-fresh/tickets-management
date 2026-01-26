
import { db } from "@/db";
import { tickets, comments, users } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq, desc, inArray } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDate, translateStatus, translatePriority } from "@/lib/utils/format";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { AdminTicketControls } from "./admin-ticket-controls";
import { MarkAsViewed } from "./mark-as-viewed";
import { WatchersManager } from "./watchers-manager";
import { CancelTicketButton } from "./cancel-ticket-button";
import { UserValidationControls } from "./user-validation-controls";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { CommentForm } from "./comment-form";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

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

    const allUsers = await db.select().from(users);

    // Fetch watchers details
    let watchersList: typeof users.$inferSelect[] = [];
    if (ticket.watchers && ticket.watchers.length > 0) {
        watchersList = await db.select().from(users).where(inArray(users.id, ticket.watchers));
    }

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
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">{ticket.ticketCode}</span>
                        <Badge className={
                            ticket.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-100/80' :
                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' :
                                    ticket.status === 'resolved' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100/80' :
                                        'bg-red-100 text-red-800 hover:bg-red-100/80'
                        }>
                            {translateStatus(ticket.status)}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-3">{ticket.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.createdBy.image || undefined} />
                            <AvatarFallback className="bg-cyan-600 text-white text-xs">
                                {ticket.createdBy.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{ticket.createdBy.name}</span>
                        <span>•</span>
                        <span>Creado el {formatDate(ticket.createdAt)}</span>
                    </div>
                </div>
                {isCreator && !isTicketClosed && (
                    <CancelTicketButton ticketId={ticketId} />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Technical Details Accordion - FIRST */}
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details" className="border rounded-lg px-4">
                            <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground hover:no-underline">
                                Ver detalles técnicos completos
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 py-2 text-sm">
                                    <div>
                                        <span className="block text-muted-foreground text-xs mb-1">Categoría</span>
                                        <span className="font-medium">{ticket.category?.name || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground text-xs mb-1">Subcategoría</span>
                                        <span className="font-medium">{ticket.subcategory?.name || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground text-xs mb-1">Prioridad</span>
                                        <span className="font-medium capitalize">{translatePriority(ticket.priority)}</span>
                                    </div>

                                    <Separator className="md:col-span-2 lg:col-span-3 my-1 opacity-50" />

                                    <div>
                                        <span className="block text-muted-foreground text-xs mb-1">Área de Atención (Destino)</span>
                                        <span className="font-medium">{ticket.attentionArea?.name || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground text-xs mb-1">Área de Procedencia (Origen)</span>
                                        <span className="font-medium">{ticket.area?.name || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground text-xs mb-1">Campus</span>
                                        <span className="font-medium">{ticket.campus?.name || "—"}</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Detailed Description - SECOND, same style as technical details */}
                    <Accordion type="single" collapsible className="w-full" defaultValue="description">
                        <AccordionItem value="description" className="border rounded-lg px-4">
                            <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
                                Descripción detallada
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                                <div className="prose max-w-none text-foreground">
                                    <RichTextEditor value={ticket.description} disabled={true} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Comentarios</h3>

                        {/* Comment List */}
                        <div className="space-y-4">
                            {ticket.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-10 w-10 shrink-0">
                                        <AvatarImage src={comment.author.image || undefined} />
                                        <AvatarFallback className="bg-cyan-600 text-white font-bold text-sm">
                                            {comment.author.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between mb-2 gap-2">
                                            <p className="text-base font-semibold">{comment.author.name}</p>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 border">
                                            <div className="text-sm text-foreground [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                                                <RichTextEditor value={comment.content} disabled={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* New Comment Form */}
                        {canComment ? (
                            <CommentForm ticketId={ticketId} />
                        ) : (
                            <div className="bg-muted border border-border rounded-lg p-4 text-center text-muted-foreground">
                                Este ticket está cerrado y no admite más comentarios.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Detalles del ticket</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {/* Solicitante */}
                            <div>
                                <span className="block text-xs text-muted-foreground mb-2 uppercase font-medium">Solicitante</span>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={ticket.createdBy.image || undefined} />
                                        <AvatarFallback className="bg-cyan-600 text-white text-xs font-bold">
                                            {ticket.createdBy.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">{ticket.createdBy.name}</span>
                                        <span className="text-xs text-muted-foreground truncate">{ticket.createdBy.email}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Asignado a */}
                            <div>
                                <span className="block text-xs text-muted-foreground mb-2 uppercase font-medium">Asignado a</span>
                                {ticket.assignedTo ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={ticket.assignedTo.image || undefined} />
                                            <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                                                {ticket.assignedTo.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{ticket.assignedTo.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic">Sin asignar</span>
                                )}
                            </div>

                            <Separator />

                            {/* Observadores */}
                            <div>
                                <span className="block text-xs text-muted-foreground mb-2 uppercase font-medium">Observadores</span>
                                {watchersList.length > 0 ? (
                                    <div className="space-y-2">
                                        {watchersList.map(watcher => (
                                            <div key={watcher.id} className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={watcher.image || undefined} />
                                                    <AvatarFallback className="text-xs">{watcher.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{watcher.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic">No hay observadores</span>
                                )}
                                {!isTicketClosed && (
                                    <div className="mt-3">
                                        <WatchersManager
                                            ticketId={ticketId}
                                            currentWatchers={ticket.watchers || []}
                                            currentUserId={session.user.id}
                                            allUsers={allUsers.map(u => ({
                                                id: u.id,
                                                name: u.name,
                                                email: u.email,
                                                image: u.image
                                            }))}
                                        />
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Prioridad */}
                            <div>
                                <span className="block text-xs text-muted-foreground mb-2 uppercase font-medium">Prioridad</span>
                                <Badge variant="outline" className="font-medium">
                                    {translatePriority(ticket.priority)}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin/Agent Controls */}
                    {(session.user.role === "admin" || isAgentForArea) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Controles</CardTitle>
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
                                            <h4 className="text-sm font-semibold mb-2">Detalles de Cierre</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div>
                                                    <span className="font-medium">Cerrado por: </span>
                                                    {ticket.closedBy === 'user' && 'Usuario (Validado)'}
                                                    {ticket.closedBy === 'admin' && 'Administrador'}
                                                    {ticket.closedBy === 'system' && 'Sistema (Auto-cierre 48hrs)'}
                                                </div>
                                                {ticket.closedAt && (
                                                    <div>
                                                        <span className="font-medium">Fecha de cierre: </span>
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

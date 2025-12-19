
import { db } from "@/db";
import { tickets, comments, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq, desc, inArray } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, translateStatus, translatePriority } from "@/lib/utils/format";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminTicketControls } from "./admin-ticket-controls";
import { MarkAsViewed } from "./mark-as-viewed";
import { WatchersManager } from "./watchers-manager";
import { CancelTicketButton } from "./cancel-ticket-button";
import { UserValidationControls } from "./user-validation-controls";
import { RichTextEditor } from "@/components/rich-text-editor";
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
            comments: {
                with: {
                    author: true
                },
                orderBy: [desc(comments.createdAt)]
            }
        }
    });

    if (!ticket) notFound();

    const allUsers = await db.select().from(users);

    // Fetch watchers details
    let watchersList: typeof users.$inferSelect[] = [];
    if (ticket.watchers && ticket.watchers.length > 0) {
        watchersList = await db.select().from(users).where(inArray(users.id, ticket.watchers));
    }

    const isTicketClosed = ticket.status === 'resolved' || ticket.status === 'voided';
    const canComment = !isTicketClosed;
    const isCreator = ticket.createdById === session.user.id;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <MarkAsViewed ticketId={ticketId} />
            <Link href={`/dashboard/${session.user.role == "admin" ? "agent" : "tickets"}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al listado de tickets
            </Link>

            {/* User Validation Controls - Only show for creators when pending validation */}
            {ticket.status === 'pending_validation' && ticket.createdById === session.user.id && (
                <UserValidationControls ticketId={ticket.id} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                    {ticket.subcategory}
                                </Badge>
                                <Badge className={
                                    ticket.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-100/80' :
                                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' :
                                            ticket.status === 'resolved' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100/80' :
                                                'bg-red-100 text-red-800 hover:bg-red-100/80'
                                }>
                                    {translateStatus(ticket.status)}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground font-mono text-lg">{ticket.ticketCode}</span>
                                    <h2 className="text-2xl font-bold tracking-tight">{ticket.title}</h2>
                                </div>
                                {isCreator && !isTicketClosed && (
                                    <CancelTicketButton ticketId={ticketId} />
                                )}
                            </div>

                            <CardDescription className="pt-2 text-xs">
                                Creado el {formatDate(ticket.createdAt)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                                <RichTextEditor value={ticket.description} disabled={true} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Actividad</h3>

                        {/* New Comment Form */}
                        {canComment ? (
                            <CommentForm ticketId={ticketId} />
                        ) : (
                            <div className="bg-muted border border-border rounded-lg p-4 text-center text-muted-foreground">
                                Este ticket está cerrado y no admite más comentarios.
                            </div>
                        )}

                        {/* Comment List */}
                        <div className="space-y-4">
                            {ticket.comments.map((comment) => (
                                <Card key={comment.id} className="bg-muted/30">
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={comment.author.image || undefined} />
                                                <AvatarFallback className="bg-cyan-600 text-white font-bold">{comment.author.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium">{comment.author.name}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-sm text-foreground">
                                                    <RichTextEditor value={comment.content} disabled={true} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <span className="block text-muted-foreground">Solicitante</span>
                                <div className="flex items-center mt-1">
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={ticket.createdBy.image || undefined} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <span>{ticket.createdBy.name}</span>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <span className="block text-muted-foreground mb-2">Watchers</span>
                                {watchersList.length > 0 ? (
                                    <div className="space-y-2">
                                        {watchersList.map(watcher => (
                                            <div key={watcher.id} className="flex items-center">
                                                <Avatar className="h-6 w-6 mr-2">
                                                    <AvatarImage src={watcher.image || undefined} />
                                                    <AvatarFallback>{watcher.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{watcher.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic text-sm">No hay watchers asignados</span>
                                )}
                                {!isTicketClosed && (
                                    <WatchersManager
                                        ticketId={ticketId}
                                        currentWatchers={ticket.watchers || []}
                                        allUsers={allUsers.map(u => ({
                                            id: u.id,
                                            name: u.name,
                                            email: u.email,
                                            image: u.image
                                        }))}
                                    />
                                )}
                            </div>
                            <Separator />
                            <div>
                                <span className="block text-muted-foreground">Prioridad</span>
                                <span className="font-medium capitalize">{translatePriority(ticket.priority)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Controls */}
                    {session.user.role === "admin" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Controles de Administrador</CardTitle>
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


import { db } from "@/db";
import { tickets, comments, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCommentAction } from "@/app/actions/comment-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminTicketControls } from "./admin-ticket-controls";
import { MarkAsViewed } from "./mark-as-viewed";

import { RichTextEditor } from "@/components/rich-text-editor";
import { CommentForm } from "./comment-form";
import { inArray } from "drizzle-orm"; // Import inArray

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

    // Fetch watchers details
    let watchersList: typeof users.$inferSelect[] = [];
    if (ticket.watchers && ticket.watchers.length > 0) {
        watchersList = await db.select().from(users).where(inArray(users.id, ticket.watchers));
    }

    const isTicketClosed = ticket.status === 'resolved' || ticket.status === 'voided';
    const canComment = !isTicketClosed; // Only check status, not role for now per user request

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <MarkAsViewed ticketId={ticketId} />
            <Link href={`/dashboard/${session.user.role == "admin" ? "agent" : "tickets"}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al listado de tickets
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2">{ticket.subcategory}</Badge>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 font-mono text-sm">{ticket.ticketCode}</span>
                                        <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                                    </div>
                                </div>
                                <Badge className={
                                    ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                                }>
                                    {ticket.status}
                                </Badge>
                            </div>
                            <CardDescription className="flex items-center space-x-2 mt-2">
                                <span>Creado el {format(ticket.createdAt, "PPP 'a las' p", { locale: es })}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none text-gray-700">
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
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                                Este ticket está cerrado y no admite más comentarios.
                            </div>
                        )}

                        {/* Comment List */}
                        <div className="space-y-4">
                            {ticket.comments.map((comment) => (
                                <Card key={comment.id} className="bg-gray-50/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={comment.author.image || ""} />
                                                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">{comment.author.name}</p>
                                                    <span className="text-xs text-gray-500">
                                                        {format(comment.createdAt, "dd MMM p", { locale: es })}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-700">
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
                                <span className="block text-gray-500">Solicitante</span>
                                <div className="flex items-center mt-1">
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={ticket.createdBy.image || ""} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <span>{ticket.createdBy.name}</span>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <span className="block text-gray-500 mb-2">Watchers</span>
                                {watchersList.length > 0 ? (
                                    <div className="space-y-2">
                                        {watchersList.map(watcher => (
                                            <div key={watcher.id} className="flex items-center">
                                                <Avatar className="h-6 w-6 mr-2">
                                                    <AvatarImage src={watcher.image || ""} />
                                                    <AvatarFallback>{watcher.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{watcher.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">No hay watchers asignados</span>
                                )}
                            </div>
                            <Separator />
                            <div>
                                <span className="block text-gray-500">Prioridad</span>
                                <span className="font-medium capitalize">{ticket.priority}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Controls */}
                    {session.user.role === "admin" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Controles de Administrador</CardTitle>
                            </CardHeader>
                            <CardContent>
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

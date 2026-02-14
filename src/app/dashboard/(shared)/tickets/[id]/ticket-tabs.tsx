"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CommentForm } from "./comment-form";
import { CopyTicketButton } from "./copy-ticket-button";
import { FileIcon, ImageIcon, FileTextIcon, FileSpreadsheetIcon, FilmIcon, ExternalLinkIcon, PaperclipIcon, MessageSquareIcon, FileText } from "lucide-react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
    () => import("@/components/shared/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })),
    {
        loading: () => <div className="h-24 animate-pulse rounded-md bg-muted" />,
    }
);

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

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface TicketTabsProps {
    description: string;
    comments: {
        id: string;
        content: string;
        formattedDate: string;
        author: {
            name: string;
            image: string | null;
        };
    }[];
    attachments: {
        id: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        driveViewLink: string;
    }[];
    ticketId: number;
    canComment: boolean;
}

export function TicketTabs({ description, comments, attachments, ticketId, canComment }: TicketTabsProps) {
    const hasAttachments = attachments && attachments.length > 0;

    return (
        <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto gap-0">
                <TabsTrigger
                    value="description"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
                >
                    <FileText className="h-4 w-4 mr-1.5" />
                    Descripción
                </TabsTrigger>
                <TabsTrigger
                    value="comments"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
                >
                    <MessageSquareIcon className="h-4 w-4 mr-1.5" />
                    Comentarios
                    {comments.length > 0 && (
                        <span className="ml-1 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-semibold">
                            {comments.length}
                        </span>
                    )}
                </TabsTrigger>
                {hasAttachments && (
                    <TabsTrigger
                        value="attachments"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
                    >
                        <PaperclipIcon className="h-4 w-4 mr-1.5" />
                        Archivos
                        <span className="ml-1 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-semibold">
                            {attachments.length}
                        </span>
                    </TabsTrigger>
                )}
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-4">
                <div className="prose prose-sm max-w-none text-foreground">
                    <RichTextEditor value={description} disabled={true} />
                </div>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="mt-4">
                <div className="space-y-4">
                    {comments.length > 0 ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[19px] top-5 bottom-5 w-px bg-border" aria-hidden />

                            <div className="space-y-5">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="relative flex gap-3">
                                        <UserAvatar
                                            name={comment.author.name}
                                            image={comment.author.image}
                                            size="md"
                                            className="shrink-0 relative z-10 ring-4 ring-background h-10 w-10"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline justify-between mb-1 gap-2">
                                                <p className="text-sm font-semibold">{comment.author.name}</p>
                                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                    {comment.formattedDate}
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
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <MessageSquareIcon className="h-8 w-8 mb-2 opacity-40" />
                            <p className="text-sm">Aún no hay comentarios</p>
                        </div>
                    )}

                    {/* New Comment Form */}
                    {canComment ? (
                        <div className="mt-2">
                            <CommentForm ticketId={ticketId} />
                        </div>
                    ) : (
                        <div className="bg-muted/50 border rounded-lg p-4 text-center text-sm text-muted-foreground">
                            Este ticket está cerrado y no admite más comentarios.
                        </div>
                    )}
                </div>
            </TabsContent>

            {/* Attachments Tab */}
            {hasAttachments && (
                <TabsContent value="attachments" className="mt-4">
                    <div className="grid gap-2">
                        {attachments.map((attachment) => (
                            <a
                                key={attachment.id}
                                href={attachment.driveViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:bg-muted/50 transition-colors group"
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
                </TabsContent>
            )}
        </Tabs>
    );
}

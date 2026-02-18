"use client";

import { useState, useTransition, lazy, Suspense } from "react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { addCommentAction } from "@/actions/comments";
import { addTicketAttachmentsAction } from "@/actions/tickets";
import { Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

const FileUpload = lazy(() =>
    import("@/components/shared/file-upload").then(mod => ({ default: mod.FileUpload }))
);

interface CommentFormProps {
    ticketId: number;
}

export function CommentForm({ ticketId }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [uploadToken, setUploadToken] = useState(() => crypto.randomUUID());
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async () => {
        if (!content || content.trim() === "<p></p>") {
            toast.error("El comentario no puede estar vacío");
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("ticketId", ticketId.toString());
            formData.append("content", content);

            const result = await addCommentAction(formData);
            if (result?.error) {
                toast.error(result.error);
                return;
            }

            // Link any uploaded files to the ticket
            await addTicketAttachmentsAction(ticketId, uploadToken);

            toast.success("Comentario agregado");
            setContent("");
            // Reset upload token so next comment gets a fresh FilePond session
            setUploadToken(crypto.randomUUID());
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-sidebar rounded-md border shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all">
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Escribe un comentario..."
                    className="min-h-[100px] border-0 focus-visible:ring-0 px-3 py-2"
                />

                {/* Separator */}
                <div className="border-t border-border" />

                {/* File upload section */}
                <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                            Archivos adjuntos <span className="font-normal">(opcional)</span>
                        </span>
                    </div>
                    <Suspense fallback={<div className="h-16 animate-pulse rounded-md bg-muted" />}>
                        <FileUpload uploadToken={uploadToken} />
                    </Suspense>
                </div>

                <div className="flex justify-end items-center bg-muted/20 px-3 py-2 border-t">
                    <Button onClick={handleSubmit} disabled={isPending || !content} size="sm" className="h-8">
                        {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Enviar comentario
                    </Button>
                </div>
            </div>
        </div>
    );
}

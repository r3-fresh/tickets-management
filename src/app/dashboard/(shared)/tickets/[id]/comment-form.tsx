"use client";

import { useState, useTransition } from "react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { addCommentAction } from "@/actions/comments";
import { Loader2, CornerDownRight } from "lucide-react";
import { toast } from "sonner";

interface CommentFormProps {
    ticketId: number;
}

export function CommentForm({ ticketId }: CommentFormProps) {
    const [content, setContent] = useState("");
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
            } else {
                toast.success("Comentario agregado");
                setContent(""); // Clear editor
            }
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

"use client";

import { useState, useTransition } from "react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { addCommentAction } from "@/actions/comments";
import { Loader2 } from "lucide-react";
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

            <div className="relative group rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm shadow-xs focus-within:border-primary/50 focus-within:ring-[3px] focus-within:ring-primary/10 transition-all duration-200 overflow-hidden">
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Escribe un comentario..."
                    className="border-0 focus-within:ring-0 ring-0 shadow-none bg-transparent min-h-[100px] rounded-none px-4 py-3"
                    disabled={isPending}
                />
                <div className="flex justify-between items-center bg-muted/30 px-3 py-2 border-t border-border/40">
                    <p className="text-[10px] text-muted-foreground font-medium pl-1 opacity-60 hidden sm:block">
                        Markdown soportado
                    </p>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !content || content === '<p></p>'}
                        size="sm"
                        className="h-8 text-xs font-medium px-4 transition-all"
                    >
                        {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        Enviar comentario
                    </Button>
                </div>
            </div>
        </div>
    );
}

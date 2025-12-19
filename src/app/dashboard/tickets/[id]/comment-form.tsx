"use client";

import { useState, useTransition } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addCommentAction } from "@/app/actions/comments";
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
        <Card>
            <CardContent className="pt-6 space-y-4">
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Escribe una respuesta..."
                />
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={isPending || !content}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Respuesta
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

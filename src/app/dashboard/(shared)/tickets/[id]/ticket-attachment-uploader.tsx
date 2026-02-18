"use client";

import { useState, lazy, Suspense, useCallback } from "react";
import { addTicketAttachmentsAction } from "@/actions/tickets";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";

const FileUpload = lazy(() =>
    import("@/components/shared/file-upload").then(mod => ({ default: mod.FileUpload }))
);

interface TicketAttachmentUploaderProps {
    ticketId: number;
}

export function TicketAttachmentUploader({ ticketId }: TicketAttachmentUploaderProps) {
    // Each mount gets its own token; we reset it after a successful link
    const [uploadToken, setUploadToken] = useState(() => crypto.randomUUID());

    const handleFilesChange = useCallback(
        async (attachmentIds: string[]) => {
            // Called by FileUpload whenever a file finishes uploading (or is removed).
            // We only act when there are newly uploaded files.
            if (attachmentIds.length === 0) return;

            const result = await addTicketAttachmentsAction(ticketId, uploadToken);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Archivo adjuntado al ticket");
                // Reset token so the next upload gets a fresh session
                setUploadToken(crypto.randomUUID());
            }
        },
        [ticketId, uploadToken]
    );

    return (
        <div className="bg-sidebar border border-border/50 rounded-xl p-4 space-y-3">
            <label className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Paperclip className="w-3 h-3" />
                Adjuntar documentos
            </label>
            <Suspense fallback={<div className="h-16 animate-pulse rounded-md bg-muted" />}>
                <FileUpload
                    uploadToken={uploadToken}
                    onFilesChange={handleFilesChange}
                />
            </Suspense>
        </div>
    );
}

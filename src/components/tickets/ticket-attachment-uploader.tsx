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
    // Each mount gets its own token; we reset it after a successful batch upload
    const [uploadToken, setUploadToken] = useState(() => crypto.randomUUID());

    const handleFilesChange = useCallback(
        async (attachmentIds: string[]) => {
            // Called whenever a file finishes uploading.
            // We link immediately so the user sees progress in the ticket attachment list.
            if (attachmentIds.length === 0) return;

            const result = await addTicketAttachmentsAction(ticketId, uploadToken);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Archivo adjuntado al ticket");
            }
        },
        [ticketId, uploadToken]
    );

    const handleUploadComplete = useCallback(() => {
        // Called when ALL files in the current batch have finished processing.
        // Wait briefly so the user can see the FilePond success state before resetting.
        setTimeout(() => {
            setUploadToken(crypto.randomUUID());
        }, 3000);
    }, []);

    return (
        <div className="bg-sidebar border border-border/50 rounded-xl p-4 space-y-3">
            <label className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Paperclip className="w-3 h-3" />
                Archivos adjuntos
            </label>
            <Suspense fallback={null}>
                <FileUpload
                    key={uploadToken}
                    uploadToken={uploadToken}
                    onFilesChange={handleFilesChange}
                    onUploadComplete={handleUploadComplete}
                />
            </Suspense>
        </div>
    );
}

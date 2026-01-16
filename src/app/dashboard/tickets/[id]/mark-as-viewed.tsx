"use client";

import { useEffect } from "react";
import { markTicketAsViewed } from "@/actions/tickets";

export function MarkAsViewed({ ticketId }: { ticketId: number }) {
    useEffect(() => {
        markTicketAsViewed(ticketId);
    }, [ticketId]);

    return null;
}

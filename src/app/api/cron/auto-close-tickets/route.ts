import { db } from "@/db";
import { tickets } from "@/db/schema";
import { lt, and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { TICKET_STATUS, CLOSURE_TYPE, VALIDATION_TIMEOUT_HOURS } from "@/lib/constants/tickets";

export const dynamic = 'force-dynamic';

/**
 * Auto-close tickets that have been pending validation for more than 48 hours
 * This endpoint should be called by a cron job periodically (e.g., every hour)
 */
export async function GET(request: Request) {
    try {
        // Simple authorization - you might want to add a secret token
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const cutoffTime = new Date(now.getTime() - VALIDATION_TIMEOUT_HOURS * 60 * 60 * 1000);

        // Find tickets pending validation for more than 48 hours
        const ticketsToClose = await db
            .select({
                id: tickets.id,
                ticketCode: tickets.ticketCode,
                validationRequestedAt: tickets.validationRequestedAt,
            })
            .from(tickets)
            .where(
                and(
                    eq(tickets.status, TICKET_STATUS.PENDING_VALIDATION),
                    lt(tickets.validationRequestedAt, cutoffTime)
                )
            );

        if (ticketsToClose.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No tickets to auto-close',
                count: 0,
            });
        }

        // Close all identified tickets
        const ticketIds = ticketsToClose.map(t => t.id);

        await db.update(tickets)
            .set({
                status: TICKET_STATUS.RESOLVED,
                closedBy: CLOSURE_TYPE.SYSTEM,
                closedAt: now,
                updatedAt: now,
            })
            .where(sql`${tickets.id} = ANY(${ticketIds})`);

        console.log(`Auto-closed ${ticketsToClose.length} tickets:`, ticketsToClose.map(t => t.ticketCode));

        return NextResponse.json({
            success: true,
            message: `Successfully auto-closed ${ticketsToClose.length} ticket(s)`,
            count: ticketsToClose.length,
            closedTickets: ticketsToClose.map(t => ({
                id: t.id,
                code: t.ticketCode,
                validationRequestedAt: t.validationRequestedAt,
            })),
        });
    } catch (error) {
        console.error('Error in auto-close cron job:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

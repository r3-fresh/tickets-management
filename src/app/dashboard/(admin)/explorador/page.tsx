import { db } from "@/db";
import { tickets } from "@/db/schema";
import { queryTicketsPaginated, getTicketFilterOptions } from "@/db/queries";
import type { TicketFilterParams } from "@/db/queries";
import { getSession } from "@/lib/auth/helpers";
import { inArray } from "drizzle-orm";
import { AdminTicketsTable } from "@/components/admin/admin-tickets-table";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explorador de tickets",
};
}

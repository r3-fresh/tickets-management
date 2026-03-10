import { db } from "@/db";
import { ticketCategories, ticketSubcategories, attentionAreas } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getAppSetting } from "@/db/queries";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración del sistema",
};

export default async function SistemaPage() {
  const [
    allowNewTicketsSetting,
    disabledMessageSetting,
    categories,
    subcategories,
    attentionAreasList,
  ] = await Promise.all([
    getAppSetting("allow_new_tickets"),
    getAppSetting("ticket_disabled_message"),
    db.query.ticketCategories.findMany({
      orderBy: [asc(ticketCategories.displayOrder)],
      with: {
        subcategories: true,
      },
    }),
    db.query.ticketSubcategories.findMany({
      orderBy: [asc(ticketSubcategories.categoryId), asc(ticketSubcategories.displayOrder)],
      with: {
        category: true,
      },
    }),
    db.query.attentionAreas.findMany({
      orderBy: [asc(attentionAreas.name)],
    }),
  ]);

  const allowNewTickets = allowNewTicketsSetting === null || allowNewTicketsSetting === "true";
  const disabledMessage = disabledMessageSetting || "";

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Configuración del sistema" }]} />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración del sistema</h1>
        <p className="text-sm text-muted-foreground mt-1">Administra las opciones globales del sistema</p>
      </div>

      <AdminSettingsTabs
        initialAllowNewTickets={allowNewTickets}
        initialDisabledMessage={disabledMessage}
        initialCategories={categories}
        initialSubcategories={subcategories}
        initialAttentionAreas={attentionAreasList}
      />
    </div>
  );
}

import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";

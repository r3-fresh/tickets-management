import { db } from "@/db";
import { ticketCategories, campusLocations, workAreas, ticketSubcategories, attentionAreas } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getAppSetting } from "@/db/queries";
import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Configuración del sistema",
};
}

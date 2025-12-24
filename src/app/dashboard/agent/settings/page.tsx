import { db } from "@/db";
import { attentionAreas } from "@/db/schema";
import { requireAgent } from "@/lib/utils/server-auth";
import { eq } from "drizzle-orm";
import { SettingsForm } from "./form";

export default async function SettingsPage() {
    const session = await requireAgent();

    if (!session.user.attentionAreaId) {
        return <div>Error: No tienes área asignada.</div>;
    }

    const areaConfig = await db.query.attentionAreas.findFirst({
        where: eq(attentionAreas.id, session.user.attentionAreaId),
    });

    if (!areaConfig) {
        return <div>Error: No se encontró la configuración del área.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración del Área</h1>
                <p className="text-muted-foreground">
                    Administra las preferencias para {areaConfig.name}
                </p>
            </div>

            <SettingsForm initialData={areaConfig} />
        </div>
    );
}

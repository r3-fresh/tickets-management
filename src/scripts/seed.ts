import { db } from "@/db";
import { ticketCategories, ticketSubcategories, campusLocations, workAreas, appSettings } from "@/db/schema";

async function seed() {
    console.log("🌱 Seeding database with UC Continental data...");

    try {
        // 1. Seed Categories
        console.log("📁 Seeding categories...");
        const categories = await db.insert(ticketCategories).values([
            {
                name: "Sistema de Gestión Bibliotecaria",
                description: "Problemas del sistema bibliotecario",
                displayOrder: 1
            },
            {
                name: "Plataformas Web",
                description: "Problemas de las diferentes páginas web",
                displayOrder: 2
            },
            {
                name: "Sistematización y Reportería",
                description: "Problemas referentes a la reportería",
                displayOrder: 3
            },
        ]).returning({ id: ticketCategories.id, name: ticketCategories.name });

        console.log(`✅ Created ${categories.length} categories`);

        // 2. Seed Subcategories
        console.log("📂 Seeding subcategories...");
        const subcategories = await db.insert(ticketSubcategories).values([
            // Sistema de Gestión Bibliotecaria
            {
                categoryId: categories[0].id,
                name: "Catálogo en línea - Descubridor (Primo)",
                description: "Problemas con el catálogo en línea",
                displayOrder: 1
            },
            {
                categoryId: categories[0].id,
                name: "Autopréstamo",
                description: "Problemas con el autopréstamo",
                displayOrder: 2
            },
            {
                categoryId: categories[0].id,
                name: "Accesos/Permisos",
                description: "Problemas con los accesos y permisos",
                displayOrder: 3
            },

            // Plataformas Web
            {
                categoryId: categories[1].id,
                name: "Repositorio Institucional",
                description: "Problemas con el repositorio institucional",
                displayOrder: 1
            },
            {
                categoryId: categories[1].id,
                name: "Sitio Web Hub de Información",
                description: "Problemas con el sitio web de la institución",
                displayOrder: 2
            },
            {
                categoryId: categories[1].id,
                name: "Sitio Web Fondo Editorial",
                description: "Problemas con el sitio web del fondo editorial",
                displayOrder: 3
            },

            // Sistematización y Reportería
            {
                categoryId: categories[2].id,
                name: "Automatización de proceso y/o archivo",
                description: "Problemas con la automatización de procesos y/o archivos",
                displayOrder: 1
            },
            {
                categoryId: categories[2].id,
                name: "Actualización y/o normalización de formularios",
                description: "Problemas con la actualización y/o normalización de formularios",
                displayOrder: 2
            },
        ]).returning();

        console.log(`✅ Created ${subcategories.length} subcategories`);

        // 3. Seed Campus Locations
        console.log("🏫 Seeding campus locations...");
        const campusData = await db.insert(campusLocations).values([
            { name: "Corporativo", code: "COR", displayOrder: 1 },
            { name: "Huancayo", code: "HYO", displayOrder: 2 },
            { name: "Los Olivos", code: "LIM", displayOrder: 3 },
            { name: "Miraflores", code: "MIR", displayOrder: 4 },
            { name: "Arequipa", code: "AQP", displayOrder: 5 },
            { name: "Cusco", code: "CUS", displayOrder: 6 },
            { name: "Instituto", code: "ICC", displayOrder: 7 },
            { name: "Ica", code: "ICA", displayOrder: 8 },
            { name: "Ayacucho", code: "AYA", displayOrder: 9 },
            { name: "Virtual", code: "VIR", displayOrder: 10 },
        ]).returning();

        console.log(`✅ Created ${campusData.length} campus locations`);

        // 4. Seed Work Areas
        console.log("💼 Seeding work areas...");
        const areas = await db.insert(workAreas).values([
            {
                name: "Servicios presenciales",
                description: "Servicios de atención presencial",
                displayOrder: 1
            },
            {
                name: "Servicios Virtuales",
                description: "Servicios de atención virtual",
                displayOrder: 2
            },
            {
                name: "Apoyo a la investigación",
                description: "Servicios de apoyo a la investigación",
                displayOrder: 3
            },
            {
                name: "Gestión de recursos de información",
                description: "Gestión de recursos e información",
                displayOrder: 4
            },
        ]).returning();

        console.log(`✅ Created ${areas.length} work areas`);

        // 5. Seed App Settings
        console.log("⚙️  Seeding app settings...");
        await db.insert(appSettings).values([
            {
                key: "allow_new_tickets",
                value: "true"
            },
            {
                key: "ticket_disabled_message",
                value: "Estamos en mantenimiento. Por favor, inténtelo más tarde."
            },
        ]).onConflictDoNothing();

        console.log("✅ App settings configured");

        console.log("\n🎉 Database seeded successfully!");
        console.log("\n📝 Next steps:");
        console.log("   1. Login with Google using: fromeror@continental.edu.pe");
        console.log("   2. Promote to admin if needed:");
        console.log("      UPDATE \"user\" SET role = 'admin' WHERE email = 'fromeror@continental.edu.pe';");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
}

seed()
    .then(() => {
        console.log("✨ Seed complete!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });

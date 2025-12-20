import { db } from "@/db";
import { ticketCategories, ticketSubcategories, campusLocations, workAreas, appSettings } from "@/db/schema";

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        // 1. Seed Categories
        console.log("📁 Seeding categories...");
        const categories = await db.insert(ticketCategories).values([
            { name: "Soporte Técnico", description: "Problemas técnicos y de hardware/software", displayOrder: 1 },
            { name: "Infraestructura", description: "Infraestructura y servicios de red", displayOrder: 2 },
            { name: "Sistemas Académicos", description: "Plataformas y sistemas académicos", displayOrder: 3 },
            { name: "Biblioteca Virtual", description: "Gestión de bibliotecas digitales", displayOrder: 4 },
            { name: "Seguridad Informática", description: "Seguridad y accesos", displayOrder: 5 },
        ]).returning({ id: ticketCategories.id, name: ticketCategories.name });

        console.log(`✅ Created ${categories.length} categories`);

        // 2. Seed Subcategories
        console.log("📂 Seeding subcategories...");
        const subcategories = await db.insert(ticketSubcategories).values([
            // Soporte Técnico
            { categoryId: categories[0].id, name: "Problemas de Hardware", displayOrder: 1 },
            { categoryId: categories[0].id, name: "Problemas de Software", displayOrder: 2 },
            { categoryId: categories[0].id, name: "Impresoras", displayOrder: 3 },
            { categoryId: categories[0].id, name: "Equipos de Cómputo", displayOrder: 4 },

            // Infraestructura
            { categoryId: categories[1].id, name: "Red e Internet", displayOrder: 1 },
            { categoryId: categories[1].id, name: "WiFi", displayOrder: 2 },
            { categoryId: categories[1].id, name: "Cableado Estructurado", displayOrder: 3 },
            { categoryId: categories[1].id, name: "Telefonía IP", displayOrder: 4 },

            // Sistemas Académicos
            { categoryId: categories[2].id, name: "Canvas LMS", displayOrder: 1 },
            { categoryId: categories[2].id, name: "Sistema de Matrícula", displayOrder: 2 },
            { categoryId: categories[2].id, name: "Portal del Estudiante", displayOrder: 3 },
            { categoryId: categories[2].id, name: "Registro de Notas", displayOrder: 4 },

            // Biblioteca Virtual
            { categoryId: categories[3].id, name: "Acceso a Bases de Datos", displayOrder: 1 },
            { categoryId: categories[3].id, name: "eBooks y Recursos Digitales", displayOrder: 2 },
            { categoryId: categories[3].id, name: "Catálogo en Línea", displayOrder: 3 },

            // Seguridad Informática
            { categoryId: categories[4].id, name: "Accesos y Permisos", displayOrder: 1 },
            { categoryId: categories[4].id, name: "Contraseñas", displayOrder: 2 },
            { categoryId: categories[4].id, name: "Antivirus", displayOrder: 3 },
        ]).returning();

        console.log(`✅ Created ${subcategories.length} subcategories`);

        // 3. Seed Campus Locations
        console.log("🏫 Seeding campus locations...");
        const campusData = await db.insert(campusLocations).values([
            { name: "Corporativo", code: "CORP", displayOrder: 1 },
            { name: "Huancayo", code: "HYO", displayOrder: 2 },
            { name: "Lima", code: "LIM", displayOrder: 3 },
            { name: "Cusco", code: "CUZ", displayOrder: 4 },
            { name: "Arequipa", code: "AQP", displayOrder: 5 },
            { name: "Virtual", code: "VIRT", displayOrder: 6 },
        ]).returning();

        console.log(`✅ Created ${campusData.length} campus locations`);

        // 4. Seed Work Areas
        console.log("💼 Seeding work areas...");
        const areas = await db.insert(workAreas).values([
            { name: "GRI", description: "Gerencia de Recursos Informáticos", displayOrder: 1 },
            { name: "GRA", description: "Gerencia de Redes y Aplicaciones", displayOrder: 2 },
            { name: "Servicios Presenciales", description: "Servicios de atención presencial", displayOrder: 3 },
            { name: "Biblioteca", description: "Servicios de biblioteca", displayOrder: 4 },
            { name: "Docencia", description: "Área docente", displayOrder: 5 },
            { name: "Administración", description: "Área administrativa", displayOrder: 6 },
            { name: "Investigación", description: "Área de investigación", displayOrder: 7 },
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
                key: "ticket_disabled_title",
                value: "Creación de Tickets Temporalmente Deshabilitada"
            },
            {
                key: "ticket_disabled_message",
                value: "Actualmente no se pueden crear nuevos tickets. Por favor, intenta más tarde o contacta al administrador."
            },
        ]).onConflictDoNothing();

        console.log("✅ App settings configured");

        console.log("\n🎉 Database seeded successfully!");
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

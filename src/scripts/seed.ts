import { db } from "@/db";
import { ticketCategories, ticketSubcategories, appSettings, attentionAreas } from "@/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Seed Attention Areas (must be before categories for FK reference)
    console.log("🎯 Seeding attention areas...");
    const attentionAreasList = await db.insert(attentionAreas).values([
      {
        name: "Tecnologías y Sistemas de Información",
        slug: "TSI",
        isAcceptingTickets: true
      },
      {
        name: "Fondo Editorial",
        slug: "FED",
        isAcceptingTickets: false
      },
      {
        name: "Difusión",
        slug: "DIF",
        isAcceptingTickets: false
      }
    ]).onConflictDoNothing().returning({ id: attentionAreas.id, name: attentionAreas.name });

    console.log(`✅ Created ${attentionAreasList.length} attention areas`);

    // Get TSI area ID for linking categories
    const tsiArea = attentionAreasList.find(a => a.name.includes("Tecnologías"));

    // 2. Seed Categories (linked to attention areas)
    console.log("📁 Seeding categories...");
    const categories = await db.insert(ticketCategories).values([
      {
        name: "Sistema de Gestión Bibliotecaria",
        description: "Problemas del sistema bibliotecario",
        displayOrder: 1,
        attentionAreaId: tsiArea?.id ?? null,
      },
      {
        name: "Plataformas Web",
        description: "Problemas de las diferentes páginas web",
        displayOrder: 2,
        attentionAreaId: tsiArea?.id ?? null,
      },
      {
        name: "Sistematización y Reportería",
        description: "Problemas referentes a la reportería",
        displayOrder: 3,
        attentionAreaId: tsiArea?.id ?? null,
      },
    ]).returning({ id: ticketCategories.id, name: ticketCategories.name });

    console.log(`✅ Created ${categories.length} categories`);

    // 3. Seed Subcategories
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

    // 4. Seed App Settings
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
    console.log("   1. Login with Google using your account");
    console.log("   2. Promote to admin if needed:");
    console.log("      UPDATE \"user\" SET role = 'admin' WHERE email = 'your-email';");

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

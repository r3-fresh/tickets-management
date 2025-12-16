
import { db } from "../db";
import { categories } from "../db/schema";

const INITIAL_CATEGORIES = [
    {
        name: "Sistema de Gestión Bibliotecaria",
        subcategories: ["Accesos/Permisos", "Catálogo en línea - Descubridor (Primo)", "Circulación", "Catalogación", "Autopréstamo"],
    },
    {
        name: "Plataformas Web",
        subcategories: ["Repositorio Institucional", "Sitio Web Hub de Información", "Sitio Web Fondo Editorial", "Blog Hub de Información", "Blog Fondo Editorial", "Quiosco Virtual", "Biblioteca Virtual", "Sistema de Reservas", "Guías de recursos(Libguides)", "Turnitin", "CAU - Sílabos", "Figma"],
    },
    {
        name: "Sistematización y Reportería",
        subcategories: ["Automatización de proceso y/o archivo", "Actualización y/o normalización de formularios", "Creación de reportes", "Actualización de reportes", "Mejora de visualización de reportes"],
    }
];

async function main() {
    console.log("🌱 Seeding Categories...");
    try {
        for (const cat of INITIAL_CATEGORIES) {
            await db.insert(categories).values({
                name: cat.name,
                subcategories: cat.subcategories,
                isActive: true,
            });
        }
        console.log("✅ Categories seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding categories:", error);
    }
    process.exit(0);
}

main();

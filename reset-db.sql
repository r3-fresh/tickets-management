-- Script para resetear la tabla de tickets con la nueva estructura
-- ADVERTENCIA: Esto eliminará todos los datos existentes en la tabla ticket

-- 1. Eliminar tabla de tickets (esto eliminará también comentarios y vistas por CASCADE)
DROP TABLE IF EXISTS "ticket" CASCADE;

-- 2. Recrear tabla con nueva estructura
CREATE TABLE "ticket" (
  "id" SERIAL PRIMARY KEY,
  "ticket_code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "priority" TEXT NOT NULL,
  "created_by_id" TEXT NOT NULL REFERENCES "user"("id"),
  "assigned_to_id" TEXT REFERENCES "user"("id"),
  "category_id" INTEGER REFERENCES "category"("id"),
  "subcategory" TEXT,
  "area" TEXT DEFAULT 'No aplica',
  "campus" TEXT DEFAULT 'No aplica',
  "watchers" TEXT[],
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Recrear tabla de comentarios
CREATE TABLE IF NOT EXISTS "comment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content" TEXT NOT NULL,
  "ticket_id" INTEGER NOT NULL REFERENCES "ticket"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id"),
  "is_internal" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Recrear tabla de vistas
CREATE TABLE IF NOT EXISTS "ticket_view" (
  "id" SERIAL PRIMARY KEY,
  "ticket_id" INTEGER NOT NULL REFERENCES "ticket"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "last_viewed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("user_id", "ticket_id")
);

COMMIT;

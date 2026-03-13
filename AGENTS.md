# AGENTS.md - Guía para Agentes de Código

Este documento contiene información esencial para agentes de código (AI coding assistants) que trabajen en este repositorio.

## 📋 Información del Proyecto

**Stack Principal:**
- Next.js 16 (App Router) con TypeScript
- PostgreSQL + Drizzle ORM
- Better Auth para autenticación
- Tailwind CSS + shadcn/ui + Radix UI
- React Hook Form + Zod para validación
- pnpm como gestor de paquetes

**Idioma:** Español (UI, mensajes, comentarios)

## 🛠️ Comandos Principales

### Desarrollo
```bash
pnpm dev              # Iniciar servidor de desarrollo (puerto 3000)
pnpm build            # Compilar para producción
pnpm start            # Iniciar servidor de producción
pnpm lint             # Ejecutar ESLint
```

### Base de Datos
```bash
pnpm setup            # Setup completo: install + db:push + db:seed
pnpm db:push          # Sincronizar esquema con BD (desarrollo)
pnpm db:seed          # Cargar datos iniciales
pnpm db:studio        # Abrir Drizzle Studio (interfaz visual)
pnpm db:reset         # ⚠️ DESTRUCTIVO: Borra todo y recrea la BD
pnpm db:drop          # Eliminar todas las tablas
```

### Tests
**IMPORTANTE:** Este proyecto actualmente NO tiene tests configurados. No intentes ejecutar `pnpm test` o comandos similares.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Páginas del dashboard
│   ├── login/             # Página de login
│   └── layout.tsx         # Layout raíz
├── actions/               # Server Actions
│   ├── admin/            # Acciones de administrador
│   ├── agent/            # Acciones de agente
│   ├── tickets/          # Acciones de tickets
│   └── config/           # Configuración
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── shared/           # Componentes compartidos
│   ├── admin/            # Componentes específicos de admin
│   ├── agent/            # Componentes específicos de agente
│   └── tickets/          # Componentes de tickets
├── db/                    # Base de datos
│   ├── schema.ts         # Esquema Drizzle ORM
│   └── index.ts          # Cliente de base de datos
├── lib/                   # Utilidades y helpers
│   ├── auth/             # Helpers de autenticación
│   ├── email/            # Sistema de correos
│   ├── utils/            # Utilidades generales
│   ├── validation/       # Esquemas Zod
│   └── constants/        # Constantes de la app
├── scripts/               # Scripts de utilidad
└── types/                 # Definiciones de tipos TypeScript
```

## 🎨 Guías de Estilo de Código

### Indentación
- **2 espacios** para toda indentación (TypeScript, TSX, JSON, CSS)
- NO usar tabs ni 4 espacios

### Imports
- Usar alias `@/*` para imports desde `src/*`
- Orden: externos → internos → relativos → tipos
```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createTicketAction } from "@/actions/tickets";
import type { Ticket } from "@/types";
```

### TypeScript
- `strict: true` - El modo estricto está habilitado
- Definir interfaces para props de componentes
- Usar `type` para tipos simples, `interface` para objetos con propiedades
- Inferir tipos de la BD con Drizzle: `typeof table.$inferSelect`
- Tipos personalizados en `src/types/index.ts`

### Componentes React
```typescript
// Definir props interface antes del componente
interface MyComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  isDisabled?: boolean;
}

// Client components: agregar "use client" si usan hooks
export function MyComponent({ title, onSubmit, isDisabled = false }: MyComponentProps) {
  // ...
}
```

### Server Actions
- Ubicar en `src/actions/`
- Siempre usar `"use server"` al inicio del archivo
- Validar con Zod schemas
- Usar `requireAuth()`, `requireAdmin()`, `requireAgent()` para autenticación
- Retornar `{ error: string }` para errores, datos para éxito
```typescript
"use server";

import { db } from "@/db";
import { mySchema } from "@/lib/validation/schemas";
import { requireAuth } from "@/lib/auth/helpers";

export async function myAction(formData: FormData) {
  const session = await requireAuth();
  
  const result = mySchema.safeParse({
    field: formData.get("field"),
  });
  
  if (!result.success) {
    return { error: "Datos inválidos" };
  }
  
  // Lógica de la acción...
  return { success: true, data: result.data };
}
```

### Validación con Zod
- Schemas en `src/lib/validation/schemas.ts`
- Usar `z.coerce.number()` para IDs de formularios
- Exportar tipos inferidos: `export type MySchema = z.infer<typeof mySchema>;`

### Base de Datos
- Esquema en `src/db/schema.ts`
- Usar Drizzle ORM para todas las queries
- Cliente de BD: `import { db } from "@/db"`
- Tipos: `typeof table.$inferSelect` para SELECT, `typeof table.$inferInsert` para INSERT
```typescript
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq } from "drizzle-orm";

const ticket = await db.query.tickets.findFirst({
  where: eq(tickets.id, ticketId),
});
```

### Autenticación
- Usar helpers de `@/lib/auth/helpers`
- `requireAuth()` - Requiere usuario autenticado
- `requireAdmin()` - Requiere rol admin
- `requireAgent()` - Requiere rol agent o admin
- `getSession()` - Obtiene sesión sin redireccionar
- Roles disponibles: `'user' | 'admin' | 'agent'`

### Estilos
- Tailwind CSS para todos los estilos
- Usar utilidad `cn()` de `@/lib/utils/cn` para combinar clases
- Componentes base de shadcn/ui en `src/components/ui/`
```typescript
import { cn } from "@/lib/utils/cn";

<div className={cn("base-class", variant === "primary" && "primary-class", className)} />
```

### Constantes
- Definir en `src/lib/constants/`
- Usar objetos `as const` para enums
```typescript
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  // ...
} as const;
```

### Naming Conventions
- Archivos: kebab-case (`my-component.tsx`, `user-management.ts`)
- Componentes: PascalCase (`MyComponent`)
- Funciones/variables: camelCase (`handleSubmit`, `userData`)
- Constantes: SCREAMING_SNAKE_CASE (`TICKET_STATUS`, `MAX_LENGTH`)
- Server Actions: camelCase con sufijo `Action` (`createTicketAction`)
- Tipos/Interfaces: PascalCase (`UserRole`, `TicketStatus`)

### Manejo de Errores
- Server Actions: retornar `{ error: string }` 
- Cliente: usar `toast.error()` de sonner para mostrar errores
- Validación: usar Zod y retornar errores específicos
```typescript
if (!result.success) {
  return { error: "Mensaje de error", details: result.error.flatten() };
}
```

## 🔐 Seguridad

- NUNCA commitear `.env.local` o archivos con secretos
- Usar variables de entorno para configuración sensible
- Validar SIEMPRE inputs del usuario con Zod
- Usar helpers de autenticación en TODAS las server actions
- Drizzle ORM previene inyección SQL automáticamente

## 📦 Dependencias Importantes

- `better-auth` - Sistema de autenticación
- `drizzle-orm` + `drizzle-kit` - ORM y migraciones
- `zod` - Validación de schemas
- `react-hook-form` - Manejo de formularios
- `@radix-ui/*` - Componentes primitivos accesibles
- `sonner` - Notificaciones toast
- `lucide-react` - Iconos
- `dayjs` - Manejo de fechas
- `tiptap` - Editor de texto enriquecido
- `filepond` - Gestión de archivos

## 🚨 Notas Importantes

1. **NO crear tests**: El proyecto no tiene framework de testing configurado
2. **Usar pnpm**: NO usar npm o yarn
3. **Mensajes en español**: Todos los mensajes de error, UI, y comentarios deben estar en español
4. **Strict mode**: TypeScript está en modo estricto, no usar `any`
5. **Server/Client separation**: Marcar client components con `"use client"`
6. **Path alias**: Siempre usar `@/*` en vez de rutas relativas complicadas
7. **Proxy vs Middleware**: El proyecto usa `proxy.ts` (Next.js 16) en vez de `middleware.ts`
8. **Rate Limiting**: Las server actions críticas tienen rate limiting implementado (ver `src/lib/utils/rate-limit.ts`)
9. **Error Handling**: Todas las rutas principales tienen `error.tsx` y `not-found.tsx` para mejor UX
10. **Capitalización**: Seguir la convención de "Solo capitalizar la primera letra de la frase" en todos los textos UI

## 🔐 Seguridad y Rate Limiting

- **Rate Limiting implementado**: Las acciones críticas tienen protección contra abuso
  - Creación de tickets: 10 por minuto por usuario
  - Comentarios: 10 por minuto por usuario
  - Derivaciones: 10 por minuto por agente
  - Acciones de admin: 30 por minuto por admin
- Rate limiter ubicado en: `src/lib/utils/rate-limit.ts`
- Para crear nuevos limiters: `createRateLimiter('MODERATE')` o `createRateLimiter('STRICT')`

## 📧 Sistema de Correos

- Se utiliza **Gmail API** (googleapis) para el envío de correos
- Configuración en `src/lib/email/gmail-client.ts`
- Plantillas de correo en `src/lib/email/templates/`
- El envío de correos usa `after()` para no bloquear respuestas

## 🗺️ Plan de Desarrollo

El plan completo con todas las fases está documentado en:
`docs/plans/2026-03-10-corrections-and-features-plan.md`

### Estado actual
- **Fases 2a-2c:** Completadas (eliminación campus/work_areas, códigos de ticket con slug, URLs con ticketCode, emails sin slug)
- **Fase 3:** Completada - Correcciones inmediatas (emails HTML fix, dashboards filtrados, límite 5MB, nombre de agente en emails)
- **Fase 4:** Completada - Formularios por área de atención (clasificación-first flow, campos Difusión, prioridad para todas las áreas, Calendar date pickers)
- **Fase 5:** Completada - Prioridades configurables por área (tabla `priority_config`, admin/agent UI, tooltips dinámicos, SLA en detalle)
- **Fase 6:** Completada - Módulo de proveedores y tickets derivados (tablas `providers` + `provider_tickets`, CRUD admin/agente, página tickets derivados con filtros)
- **Fase 7:** Completada - Sección Actividad y derivaciones (columnas `type`+`metadata` en comments, timeline diferenciada, formulario derivación para agentes)

### Reglas de desarrollo
- Cada fase se implementa en una **branch independiente**
- Se requiere **aprobación del usuario** antes de merge a main
- Después del merge se elimina la branch
- Base de datos es **Neon (nueva, vacía)** — no hay datos legacy que preservar
- La migración de datos del viejo DB al nuevo será al final de todo

### Decisiones de arquitectura tomadas
- **Códigos de ticket:** `{SLUG}-{year}-{sequence}` con tabla `ticket_sequence` (contador nunca decrementa)
- **Slugs:** Uppercase de 3 letras: `TSI`, `DIF`, `FED`
- **URLs:** `/dashboard/tickets/{ticketCode}` (no ID numérico) — ej: `/dashboard/tickets/TSI-2026-0001`
- **Email subjects:** `Ticket #2026-0001 | Título` (sin slug de área, helper `getDisplayCode()`)
- **Áreas de atención:** Solo 3 áreas fijas (TSI, Difusión, Fondo Editorial), no crecerán
- **Campos de Difusión:** Columnas nullable en tabla `tickets` (no JSON): `activityStartDate`, `desiredDiffusionDate`, `targetAudience`
- **Formulario de tickets:** Flujo classification-first — el usuario primero elige área/categoría/subcategoría, luego aparece el resto del formulario con animación
- **Prioridad:** Requerida para TODAS las áreas (incluyendo Difusión). Campo nullable en BD para compatibilidad
- **Fechas en formulario:** Calendar date pickers (react-day-picker v9 con locale `es`), no inputs nativos
- **Archivos adjuntos:** No disponibles para Difusión (ni en formulario ni en detalle)
- **Prioridades por área:** Tabla `priority_config` con 4 filas por área (descripción + SLA editables)
- **Proveedores:** Tabla `providers` configurable por área, tickets derivados en tabla `provider_tickets` como módulo independiente con enlace opcional a ticket del sistema
- **Tickets derivados:** Página `/dashboard/proveedores` para agentes con tabla, filtros por proveedor/estado, y formulario con date picker. Solo 2 estados: `en_proceso` y `cerrado`
- **Actividad:** Renombrar "Comentarios" a "Actividad", agregar `type` a comments (comment/derivation/system)
- **Proxy:** El proyecto usa `proxy.ts` en la raíz (Next.js 16), NO `middleware.ts`

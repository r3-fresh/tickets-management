# Plan de implementación — Batch de funcionalidades (2026-03-20)

> Cada fase se implementa en una **branch independiente**. No se hace merge a `main` sin revisión y aprobación del usuario.

---

## Reglas generales

- Lenguaje de la UI: **español**
- TypeScript estricto (`strict: true`), sin `any`
- Server Actions en `src/actions/`, siempre con `"use server"`
- Estilos con Tailwind CSS + `cn()` de `@/lib/utils/cn`
- Verificar con `pnpm exec tsc --noEmit` antes de cada merge
- Ramas: `feature/<nombre-corto>`

---

## Fase 1 — Mensaje de rechazo / solicitud de mejoras
**Branch:** `feature/rejection-message`

### Contexto
Actualmente `user-validation-controls.tsx` tiene un `AlertDialog` simple para "Solicitar mejoras" que llama a `rejectTicketValidation(ticketId)` sin ningún mensaje. El usuario no puede explicar qué debe corregirse.

### Cambios

#### `src/components/tickets/user-validation-controls.tsx`
- Reemplazar el `AlertDialog` de "Solicitar mejoras" por un `Dialog` con:
  - `Textarea` para el mensaje (obligatorio, mínimo ~10 caracteres)
  - Botones: Cancelar / Solicitar mejoras
- El estado del mensaje se maneja con `useState`

#### `src/actions/tickets/index.ts` (o donde vive `rejectTicketValidation`)
- Añadir parámetro `rejectionMessage: string` a la función
- Insertar un nuevo `comment` de tipo `'comment'` con el mensaje del usuario (para que aparezca en la sección de Actividad)
- Pasar el mensaje a la función de email `ticketRejected`

#### `src/lib/email/templates/` → plantilla de rechazo
- Incluir el bloque del mensaje de rechazo en el HTML del correo (si `rejectionMessage` existe)

### Verificación
1. `pnpm exec tsc --noEmit` → sin errores
2. Login como usuario → abrir ticket en estado `pending_validation`
3. Hacer clic en "Solicitar mejoras" → debe abrirse un Dialog con textarea
4. Enviar sin texto → debe validar y no enviar
5. Enviar con texto → toast de éxito, el comentario aparece en Actividad, el correo incluye el mensaje

---

## Fase 2 — Nota opcional en derivación a proveedores
**Branch:** `feature/derivation-notes`

### Contexto
`derivation-form.tsx` registra una derivación a proveedor pero sin campo de nota/observación. El agente necesita dejar contexto adicional.

### Cambios

#### `src/components/tickets/derivation-form.tsx`
- Añadir `Textarea` con label "Nota adicional (opcional)" debajo del campo de fecha
- Estado `note` con `useState`
- Pasar al FormData como `note`

#### `src/actions/comments/index.ts` → `addDerivationAction`
- Leer `note` del FormData
- Guardar en el campo `metadata` del comment de derivación: `{ providerName, externalCode?, estimatedDate?, note }`

#### `src/app/dashboard/(shared)/tickets/[codigo]/page.tsx` (o componente de timeline)
- Mostrar el campo `note` del metadata en el banner ámbar de derivación si existe

### Verificación
1. `pnpm exec tsc --noEmit` → sin errores
2. Login como agente → abrir ticket → Registrar derivación
3. Dejar la nota vacía → debe funcionar igual que antes
4. Añadir nota → tras confirmar, en la sección de Actividad debe aparecer la nota dentro del banner de derivación

---

## Fase 3 — Encuestas de satisfacción para todas las áreas
**Branch:** `feature/surveys-all-areas`

### Contexto
`getSurveyResultsAction` actualmente solo devuelve encuestas del área del agente autenticado (hardcoded para TSI según la descripción de la página). Necesitamos:
- **Agente**: ver solo encuestas de su área
- **Admin**: ver encuestas globales + filtro por área

### Cambios

#### `src/actions/surveys/index.ts`
- Actualizar `getSurveyResultsAction` para filtrar por `attentionAreaId` del agente autenticado
- Crear (o extender) para que admin pueda pasar `areaId?: number` y obtener global o por área

#### `src/app/dashboard/(agent)/encuestas/page.tsx`
- Actualizar descripción ("Resultados de las encuestas post-atención de tickets TSI" → nombre dinámico del área)
- Pasar a `SurveyResultsView` la info del área

#### `src/app/dashboard/(admin)/encuestas/page.tsx` [NUEVO]
- Crear página de encuestas para admin
- Tabs o selector de área (TSI / DIF / FED) + una vista global
- Reutilizar `SurveyResultsView` pasando los datos filtrados

#### `src/app/dashboard/layout.tsx`
- Verificar que `ADMIN_NAV_ITEMS` incluye el link a encuestas (ya está: `{ href: "/dashboard/encuestas", label: "Encuestas", icon: BarChart3 }`)
- Crear ruta `/dashboard/encuestas` para admin en `(admin)` group

#### `src/components/surveys/pending-survey-banner.tsx`
- Verificar que el banner aparece para cualquier área (no solo TSI); ajustar si hay condición hardcoded

### Verificación
1. `pnpm exec tsc --noEmit` → sin errores
2. Login como agente de TSI → `/dashboard/encuestas` → ver solo encuestas TSI
3. Login como agente de FED → `/dashboard/encuestas` → ver solo encuestas FED
4. Login como admin → `/dashboard/encuestas` → ver selector de área y vista global
5. Resolver ticket de cualquier área → el banner de encuesta debe aparecer para el usuario

---

## Fase 4 — Encuesta de satisfacción para tickets de proveedores
**Branch:** `feature/provider-survey`

### Contexto
Los tickets de proveedor (`provider_tickets`) se cierran con una fecha de atención, pero no tienen encuesta de satisfacción. Se recibe comentario sobre si el proveedor cumplió el SLA, calidad, etc.

### Cambios

#### `src/db/schema.ts`
- Añadir tabla `providerSatisfactionSurveys` con las **5 preguntas exactas** (escala 1-5, sin campo de comentarios):
  ```typescript
  export const providerSatisfactionSurveys = pgTable("provider_satisfaction_survey", {
    id: serial("id").primaryKey(),
    providerTicketId: integer("provider_ticket_id").notNull().references(() => providerTickets.id).unique(),
    attentionAreaId: integer("attention_area_id").notNull().references(() => attentionAreas.id),
    submittedById: text("submitted_by_id").notNull().references(() => users.id),
    responseTimeRating: smallint("response_time_rating").notNull(),    // Tiempo de respuesta del proveedor
    deadlineRating: smallint("deadline_rating").notNull(),             // Cumplimiento de plazos
    qualityRating: smallint("quality_rating").notNull(),               // Calidad del entregable
    requirementUnderstandingRating: smallint("requirement_understanding_rating").notNull(), // Comprensión del requerimiento
    attentionRating: smallint("attention_rating").notNull(),           // Satisfacción con la atención del proveedor
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  ```
- La encuesta es **opcional** — solo la fecha de cierre (`completionDate`) es obligatoria
- Añadir relaciones a `providerTickets` y `attentionAreas`
- Ejecutar `pnpm db:push`

#### `src/app/dashboard/(agent)/proveedores/page.tsx` (modal de cierre)
- Dentro del modal donde se ingresa la fecha de atención (`completionDate`), añadir el formulario de evaluación (estrellas 1-5 para los 4 criterios + textarea de comentarios opcional)
- La encuesta es obligatoria para poder cerrar el ticket

#### `src/actions/providers/index.ts` → `closeProviderTicketAction`
- Recibir los datos de la encuesta junto con la fecha de atención
- Insertar en `providerSatisfactionSurveys` en la misma transacción

#### `/dashboard/encuestas` (admin y agente)
- Añadir una sección/tab para "Encuestas de proveedores" con sus métricas

### Verificación
1. `pnpm exec tsc --noEmit` → sin errores
2. `pnpm db:push` → sin errores de schema
3. Login como agente → ir a proveedores → cerrar ticket
4. El modal debe mostrar el formulario de evaluación
5. Intentar cerrar sin llenar estrellas → debe validar
6. Cerrar con evaluación completa → toast de éxito
7. En `/dashboard/encuestas` → ver resultados de proveedores

---

## Fase 5 — Corrección de tablas en panel de inicio
**Branch:** `feature/dashboard-table-fixes`

### Contexto
Las tablas resumen del dashboard muestran solo tickets `open` e `in_progress`. Se deben incluir `pending_validation` en "Mis tickets" y "En seguimiento" para usuario y agente. La tabla "Tickets recientes del área" del agente permanece igual.

### Cambios

#### `src/components/dashboard/user-dashboard.tsx`
- Cambiar `ACTIVE_STATUSES = ["open", "in_progress"]` a `USER_ACTIVE_STATUSES = ["open", "in_progress", "pending_validation"]`
- Actualizar todas las queries de `recentUserTickets` y `recentWatchedTickets` para usar los 3 estados

#### `src/components/dashboard/agent-dashboard.tsx`
- Añadir constante `USER_ACTIVE_STATUSES = ["open", "in_progress", "pending_validation"]` para queries de "Mis tickets" y "En seguimiento"
- Dejar `ACTIVE_STATUSES = ["open", "in_progress"]` solo para la query de "Tickets recientes del área"
- Actualizar queries correspondientes

### Verificación
1. `pnpm exec tsc --noEmit` → sin errores
2. Login como usuario → crear ticket → cambiar a `pending_validation` (via admin)
3. En el dashboard del usuario → "Mis tickets" debe mostrar ese ticket
4. Login como agente → verificar que "Tickets del área" solo muestra `open`/`in_progress`

---

## Fase 6 — Agrupación del menú lateral
> ✅ **Aprobado por el usuario** — implementar tras Fase 7.

### Menú actual para Agente (7 items en Navegación + configuración en Recursos)
```
Navegación:
  - Mi panel
  - Nuevo ticket
  - Mis tickets
  - En seguimiento
  - Tickets del área
  - Tickets de proveedores
  - Encuestas

Recursos:
  - Base de conocimiento
  - Configuración del área
```

### Agrupación propuesta para Agente
```
Navegación:
  - Mi panel

  ── Tickets ──
  - Nuevo ticket
  - Mis tickets
  - En seguimiento
  - Tickets del área

  ── Proveedores ──
  - Tickets de proveedores
  - Encuestas de proveedores  (si se añade en Fase 4)

  ── Análisis ──
  - Encuestas

Recursos:
  - Base de conocimiento
  - Configuración del área
```

### Menú actual para Admin (3 items en Navegación + 2 en Recursos)
```
Navegación:
  - Panel de control
  - Explorador de tickets
  - Encuestas

Recursos:
  - Base de conocimiento
  - Gestión de usuarios
  - Configuración del sistema
```

### Agrupación propuesta para Admin
```
Navegación:
  - Panel de control

  ── Tickets ──
  - Explorador de tickets

  ── Análisis ──
  - Encuestas (usuarios)
  - Encuestas (proveedores)  (si Fase 4)

Administración:
  - Gestión de usuarios
  - Configuración del sistema

Recursos:
  - Base de conocimiento
```

> ⚠️ **Pendiente decisión del usuario** antes de implementar.

---

## Fase 7 — Mejoras visuales del dashboard (gráficos)
**Branch:** `feature/dashboard-charts`

### Contexto
Los dashboards muestran tarjetas de estadísticas numéricas. Se añadirán gráficos para hacer la información más visual. Las tablas de tickets recientes **no se eliminan**.

### Tecnología sugerida
`recharts` (ya disponible vía shadcn/ui chart components). Si no está instalado: `pnpm add recharts`.

### Cambios

#### `src/components/dashboard/user-dashboard.tsx`
- Añadir gráfico de donut/pie mostrando distribución de estados de los tickets del usuario
- Datos: abiertos, en progreso, pendiente validación, resueltos

#### `src/components/dashboard/agent-dashboard.tsx`
- Gráfico de barras agrupadas: estado del área vs estado personal
- O dos donuts lado a lado (área / personal)

#### `src/components/dashboard/admin-dashboard.tsx`
- Gráfico de barras por área (TSI/DIF/FED) con comparativa de estados
- Opcional: línea de tiempo de tickets resueltos por mes

### Verificación
1. `pnpm exec tsc --noEmit` → sin errores
2. `pnpm dev` → abrir dashboard de cada rol y verificar que los gráficos renderizan correctamente
3. Verificar en modo claro y oscuro
4. Verificar responsive en pantalla pequeña

---

## Orden de implementación recomendado

| # | Fase | Branch | Impacto BD |
|---|------|--------|-----------|
| 1 | Mensaje de rechazo | `feature/rejection-message` | No |
| 2 | Nota en derivación | `feature/derivation-notes` | No |
| 5 | Corrección tablas dashboard | `feature/dashboard-table-fixes` | No |
| 3 | Encuestas todas las áreas | `feature/surveys-all-areas` | No |
| 4 | Encuesta proveedores | `feature/provider-survey` | Sí (`pnpm db:push`) |
| 7 | Gráficos dashboard | `feature/dashboard-charts` | No |
| 6 | Agrupación menú *(previa aprobación)* | `feature/sidebar-grouping` | No |

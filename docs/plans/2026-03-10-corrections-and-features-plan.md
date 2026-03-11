# Plan de correcciones y nuevas funcionalidades

**Fecha:** 2026-03-10
**Estado:** En progreso
**Ramas:** Cada fase usa una branch independiente que requiere aprobacion antes de merge a main.

---

## Fases completadas

### Fase 2a: Eliminar campus_locations y work_areas
- **Branch:** `feat/remove-campus-area` (mergeada)
- Eliminacion de tablas `campus_locations` y `work_areas` y todas las referencias (21 archivos, ~2210 lineas).

### Fase 2b: Codigos de ticket con slug de area
- **Branch:** `feat/area-ticket-codes` (mergeada)
- Tabla `ticket_sequence` con contador auto-incremental por area+year.
- Formato: `{SLUG}-{year}-{sequence}` (ej: `TSI-2026-0001`).
- Funcion `insertTicketWithCode` con UPSERT atomico.

### Fase 2c: URLs con ticketCode y emails sin slug
- **Branch:** `feat/area-ticket-codes` (mergeada junto con 2b)
- Ruta `[id]` renombrada a `[code]`, lookup por `ticketCode`.
- Todos los hrefs, redirects, revalidatePath usan ticketCode.
- Subjects de email: `Ticket #2026-0001 | Titulo` (sin slug de area).
- Helper `getDisplayCode()` para extraer la parte visible del codigo.

### Fase 3: Correcciones inmediatas
- **Branch:** `fix/corrections-batch-1` (mergeada)
- 3.1: Email "Nueva solicitud de atencion" — HTML a texto plano con `htmlToPlainText()`, saludo "Estimado" cambiado a "Hola".
- 3.2: Dashboards agente/usuario — filtro de ultimos tickets cambiado a solo `open` e `in_progress`.
- 3.3: Limite de archivos reducido a 5 MB (cliente FilePond + API + textos UI).
- 3.4: Email "Ticket asignado" — incluye nombre del agente asignado en la descripcion.

### Fase 4: Formularios por area de atencion
- **Branch:** `feat/area-specific-forms` (mergeada)
- **Slugs actualizados a UPPERCASE de 3 letras:** `TSI`, `DIF`, `FED`
- **Flujo classification-first:** El usuario primero elige area/categoria/subcategoria en una card compacta. Una vez completada la clasificacion, el resto del formulario aparece con animacion (grid-rows CSS transition).
- **Prioridad para TODAS las areas:** Incluida Difusion. Campo `priority` nullable en BD para compatibilidad con registros sin prioridad.
- **Columnas nuevas en tabla `tickets`:** `activityStartDate` (date), `desiredDiffusionDate` (date), `targetAudience` (text) — todas nullable.
- **Calendar date pickers:** react-day-picker v9 con locale `es` para fechas de Difusion (no inputs nativos).
- **Archivos adjuntos:** Ocultos para area DIF tanto en formulario como en detalle del ticket.
- **Publico objetivo:** Desplegable con opciones preestablecidas + opcion "Otro" con input libre.
- **Detalle del ticket:** Muestra campos de Difusion en sidebar cuando aplica, oculta adjuntos para DIF.
- **Schema unificado en cliente:** Un solo `useForm` con schema unificado (campos opcionales) para evitar problemas de tipos con react-hook-form + TypeScript.
- **Validacion en servidor:** Dos schemas separados (`createTicketSchema` para TSI/FED, `createDiffusionTicketSchema` para DIF) validados segun el slug del area.
- **Skeletons actualizados:** Todas las paginas de tabla ahora muestran 9 columnas + 5 filtros + buscador. Skeleton de nuevo ticket refleja el flujo classification-first.

---

## Fases pendientes

### Fase 5: Prioridades configurables por area
- **Branch:** `feat/priority-config`
- **Prioridad:** Media

#### 5.1 Schema
- Nueva tabla `priority_config`:
  - `id` (serial, PK)
  - `attentionAreaId` (FK a attention_areas)
  - `priority` (text: low/medium/high/critical)
  - `description` (text)
  - `slaHours` (integer, horas de SLA)
  - UNIQUE(attentionAreaId, priority)

#### 5.2 Seed
- Al crear un area, seedear 4 filas con valores por defecto.
- Seed inicial para las 3 areas existentes.

#### 5.3 UI de configuracion
- Admin: En la seccion de sistema, poder editar descripcion y SLA de prioridades por area.
- Agente: En su seccion de configuracion, poder editar las prioridades de su area.

#### 5.4 Formulario de tickets
- Mostrar las descripciones de prioridad segun el area seleccionada (tooltip o texto auxiliar).

---

### Fase 6: Modulo de proveedores y tickets derivados
- **Branch:** `feat/provider-tickets`
- **Prioridad:** Media

#### 6.1 Schema
- Tabla `providers`:
  - `id` (serial, PK)
  - `name` (text)
  - `attentionAreaId` (FK)
  - `isActive` (boolean, default true)
  - `createdAt`, `updatedAt`

- Tabla `provider_tickets`:
  - `id` (serial, PK)
  - `externalCode` (text) - N ticket/ID manual, variable
  - `title` (text) - Titulo o tema de requerimiento
  - `requestDate` (date) - Fecha de requerimiento
  - `description` (text) - Descripcion del requerimiento
  - `requestedById` (FK a users) - Solicitado por (agente del area)
  - `status` (text: en_proceso/cerrado)
  - `providerId` (FK a providers)
  - `ticketId` (FK nullable a tickets) - Enlace opcional con ticket del sistema
  - `attentionAreaId` (FK)
  - `createdAt`, `updatedAt`, `createdById`

#### 6.2 Seed
- Proveedores iniciales:
  - TSI: Elogim, Exlibris, Intelego
  - Difusion: Comunicacion al Estudiante (DSEE), Experiencia de Marca y Producto, Audiovisual, Gestion Docente, Fondo Editorial

#### 6.3 UI de configuracion
- CRUD de proveedores por area (similar a categorias).

#### 6.4 Vista de agentes
- Nueva seccion/pagina en el dashboard de agentes para registrar tickets derivados.
- Tabla con filtros por proveedor, estado, fecha.
- Formulario de registro con campo de enlace opcional a ticket del sistema.

---

### Fase 7: Seccion Actividad y derivaciones
- **Branch:** `feat/activity-section`
- **Prioridad:** Media

#### 7.1 Schema
- Agregar columna `type` a tabla `comments`:
  - Valores: `comment` (default), `derivation`, `system`
- Agregar columna `metadata` (jsonb, nullable) para datos extra de eventos.

#### 7.2 UI - Renombrar
- "Comentarios" pasa a llamarse "Actividad" en el detalle del ticket.

#### 7.3 Eventos de derivacion
- Cuando el agente informa una derivacion, se crea un registro tipo `derivation`.
- Se muestra como banner especial en la linea de tiempo (diferente a un comentario normal).
- Metadata: `{ provider: "Elogim", area: "TSI" }` o similar.

#### 7.4 Timeline unificada
- Comentarios + eventos de sistema en orden cronologico.
- Estilos diferenciados: comentarios con burbujas, derivaciones con banners, eventos de sistema con texto gris.

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

## Fases completadas (cont.)

### Fase 5: Prioridades configurables por area
- **Branch:** `feat/priority-config` (mergeada)
- Tabla `priority_config` con 4 filas por area (12 total): description + slaHours editables.
- Admin UI: 6ta tab "Prioridades" en sistema con tabla+modal, filtro por area.
- Agent UI: 4ta tab "Prioridades" en configuracion, edita solo su area.
- Formulario de tickets: tooltips dinamicos con descripcion de prioridad segun area seleccionada.
- Detalle de ticket: muestra SLA configurado en sidebar.

### Fase 6: Modulo de proveedores y tickets derivados
- **Branch:** `feat/provider-tickets` (mergeada)
- Tabla `providers` (id, name, attentionAreaId, isActive, timestamps).
- Tabla `provider_tickets` (id, externalCode, title, requestDate, description, requestedById, status, providerId, ticketId nullable, attentionAreaId, createdById, timestamps).
- Seed: 8 proveedores iniciales (3 TSI + 5 Difusion).
- Validacion: Zod schemas para CRUD de proveedores y tickets derivados.
- Server actions: Admin provider CRUD, agent provider CRUD, agent provider ticket CRUD con rate limiting.
- Admin UI: 6ta tab "Proveedores" en sistema con tabla+modal y filtro por area.
- Agent config UI: 5ta tab "Proveedores" en configuracion, CRUD de proveedores del area.
- Agent "Tickets derivados": Nueva pagina `/dashboard/proveedores` con tabla, filtros (proveedor, estado), y formulario create/edit con date picker y enlace opcional a ticket.
- Sidebar: Nueva entrada "Tickets derivados" con icono Truck en navegacion de agente.
- Estados de ticket derivado: `en_proceso` y `cerrado` (2 estados simples).

---

## Fases pendientes

(Ninguna — todas las fases han sido completadas.)

---

## Fases completadas (cont. 2)

### Fase 7: Seccion Actividad y derivaciones
- **Branch:** `feat/activity-section` (mergeada)
- Schema: columnas `type` (text, default 'comment') y `metadata` (jsonb, nullable) en tabla `comments`.
- Tipos: `CommentType` ('comment' | 'derivation' | 'system'), `DerivationMetadata` interface.
- Constantes: `COMMENT_TYPE`, `COMMENT_TYPE_LABELS`.
- Server action `addDerivationAction`: agentes registran derivaciones con proveedor + codigo externo opcional.
- Queries: `commentCount` y `unreadCommentCount` filtran solo `type='comment'` para badges en listas.
- UI: "Comentarios" renombrado a "Actividad" en detalle del ticket.
- Timeline diferenciada: comentarios (burbujas), derivaciones (banner amber con icono Truck), sistema (texto gris).
- Formulario de derivacion: dialog con select de proveedores del area, visible solo para agentes/admins.
- Dashboard admin: "Comentarios totales" renombrado a "Actividad total".

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
- Formato: `{slug}-{year}-{sequence}` (ej: `tsi-2026-0001`).
- Funcion `insertTicketWithCode` con UPSERT atomico.

### Fase 2c: URLs con ticketCode y emails sin slug
- **Branch:** `feat/area-ticket-codes` (mergeada junto con 2b)
- Ruta `[id]` renombrada a `[code]`, lookup por `ticketCode`.
- Todos los hrefs, redirects, revalidatePath usan ticketCode.
- Subjects de email: `Ticket #2026-0001 | Titulo` (sin slug de area).
- Helper `getDisplayCode()` para extraer la parte visible del codigo.

---

## Fases pendientes

### Fase 3: Correcciones inmediatas
- **Branch:** `fix/corrections-batch-1`
- **Prioridad:** Alta

#### 3.1 Email "Nueva solicitud de atencion" - HTML en descripcion
- El campo descripcion se renderiza con etiquetas HTML crudas en el correo.
- Solucion: Convertir HTML a texto plano o renderizar correctamente en el template.
- Ademas, cambiar "Estimado" por "Hola" en el saludo.

#### 3.2 Dashboards agente/usuario - Filtrar ultimos tickets
- Las tablas de ultimos tickets en los dashboards de agente y usuario muestran tickets con estado `pending_validation`.
- Solo deben mostrar tickets con estado `open` e `in_progress`.

#### 3.3 Limite de archivos 5MB
- Vercel tiene un limite de 5MB por archivo en uploads.
- Actualizar validacion en FilePond y en la API de upload.
- Mostrar mensaje claro cuando el usuario intente subir un archivo mayor a 5MB.
- Actualizar textos descriptivos en la UI.

#### 3.4 Email "Ticket asignado" - Incluir nombre del agente
- Actualizar el template de correo para que la descripcion incluya el nombre del agente encargado de la atencion.

---

### Fase 4: Formularios por area de atencion
- **Branch:** `feat/area-specific-forms`
- **Prioridad:** Alta

#### 4.1 Arquitectura
- Cada area de atencion tendra su propio formulario de creacion de ticket.
- Solo hay 3 areas fijas (TSI, Difusion, Fondo Editorial) que no van a crecer.
- El formulario detecta el area seleccionada y muestra/oculta campos segun el slug.

#### 4.2 Schema - Columnas para Difusion
- Agregar columnas nullable a la tabla `tickets`:
  - `activityStartDate` (date, nullable) - Fecha de inicio de la actividad
  - `desiredDiffusionDate` (date, nullable) - Fecha deseable de inicio de difusion
  - `targetAudience` (text, nullable) - Publico objetivo
- Estas columnas seran NULL para tickets de TSI y Fondo Editorial.

#### 4.3 TSI (slug: `tsi`)
- Formulario actual: titulo, area de atencion, categoria, subcategoria, prioridad, descripcion (rich text), archivos adjuntos.
- Campus y area de procedencia ya fueron eliminados en Fase 2a. Confirmar que no queda rastro.

#### 4.4 Difusion (slug: `dif`)
- Campos: titulo, area de atencion, categoria, subcategoria, fecha inicio actividad, fecha deseable difusion, publico objetivo (desplegable), descripcion (rich text).
- SIN opcion de adjuntar archivos (ni en formulario ni en detalle del ticket).
- Publico objetivo opciones:
  - Toda la comunidad Continental
  - Docentes de Universidad
  - Docentes de instituto
  - Administrativos UC
  - Administrativos IC
  - Todos los estudiantes UC
  - Todos los estudiantes IC
  - Posgrado
  - Otro (input libre)
- NO incluye campo de prioridad (a confirmar si Difusion usa prioridades).

#### 4.5 Fondo Editorial (slug: `fe`)
- Mismo formulario que TSI (temporal hasta desarrollo futuro).

#### 4.6 Detalle del ticket
- Mostrar campos especificos de Difusion en el detalle cuando aplique.
- Ocultar seccion de adjuntos para tickets de Difusion.

---

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

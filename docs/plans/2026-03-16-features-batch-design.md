# Plan de Implementacion - Batch de Funcionalidades

**Fecha:** 2026-03-16  
**Estado:** En progreso

---

## Branch 1: `feat/knowledge-base-config` - Enlace de Base de Conocimiento Configurable

### Contexto
El enlace de "Base de conocimiento" esta hardcodeado en `src/app/dashboard/layout.tsx` linea 35 como una URL de Google Sheets. Se necesita que el admin pueda modificar esta URL desde la configuracion del sistema.

### Cambios

1. **Seed** (`src/scripts/seed.ts`): Agregar `knowledge_base_url` a `app_settings` con la URL actual como valor por defecto
2. **Server action** (`src/actions/admin/settings.ts`): Agregar funcion para actualizar la URL
3. **UI admin** (`src/components/admin/settings-form.tsx`): Agregar input de texto "Enlace de base de conocimiento" con guardado on blur
4. **Layout** (`src/app/dashboard/layout.tsx`):
   - Cargar URL desde `appSettings` en vez del hardcoded
   - Convertir seccion "Recursos" a **Collapsible** (shadcn/ui)
5. **Pagina sistema** (`src/app/dashboard/(admin)/sistema/page.tsx`): Pasar la URL al componente de settings

### Verificacion
- `pnpm exec tsc --noEmit`
- `pnpm db:reset` (seed funciona con nuevo setting)
- UI: admin puede editar URL, sidebar muestra URL dinamica

---

## Branch 2: `feat/provider-priority` - Prioridad Referencial en Tickets de Proveedor

### Contexto
El formulario de creacion de ticket de proveedor no tiene campo de prioridad. Se necesita un select basico con 4 opciones (baja, media, alta, critica) que es solo referencial, sin vinculacion a SLA ni a `priority_config`.

### Cambios

1. **Schema** (`src/db/schema.ts`): Agregar columna `priority` (text, nullable) a `provider_ticket`
2. **Constantes**: Definir prioridades de proveedor con labels y estilos (baja/media/alta/critica)
3. **Validacion** (`src/lib/validation/schemas.ts`): Agregar `priority` a schemas create/update de provider ticket
4. **Server actions** (`src/actions/agent/provider-tickets.ts`): Procesar campo `priority` en create/update
5. **UI formulario** (`src/components/agent/provider-tickets-list.tsx`): Agregar `<Select>` de prioridad al dialog de creacion/edicion
6. **UI tabla**: Mostrar badge de prioridad con color en la tabla de listado

### Valores y estilos
- `baja` -> Badge verde
- `media` -> Badge amarillo
- `alta` -> Badge naranja
- `critica` -> Badge rojo

### Verificacion
- `pnpm exec tsc --noEmit`
- `pnpm db:reset`
- UI: crear/editar ticket de proveedor con prioridad, ver badge en tabla

---

## Branch 3: `feat/satisfaction-survey` - Encuesta de Satisfaccion Post-Atencion

### Contexto
Se necesita una encuesta de satisfaccion estilo NPS que aparezca inmediatamente despues de que el usuario confirma la resolucion de un ticket. Por ahora solo para el area TSI.

### Preguntas (escala 1-5)
1. Tiempo de respuesta (1=Muy lento, 5=Muy rapido)
2. Comunicacion y orientacion (1=Nada clara, 5=Muy clara)
3. Solucion recibida (1=No lo resolvio, 5=Completa)
4. Satisfaccion general (1=Nada satisfecho, 5=Muy satisfecho)
5. Mejoras sugeridas (texto libre, opcional)

### Base de datos - Nueva tabla `satisfaction_survey`
```
id (serial PK)
ticketId (integer FK -> tickets.id, unique, not null)
userId (text FK -> users.id, not null)
attentionAreaId (integer FK -> attentionAreas.id, not null)
responseTimeRating (integer 1-5, not null)
communicationRating (integer 1-5, not null)
solutionRating (integer 1-5, not null)
overallRating (integer 1-5, not null)
improvementSuggestion (text, nullable)
createdAt (timestamp, default now)
```

### Flujo del usuario
1. Usuario confirma solucion del ticket (clic "Confirmar solucion" en floating bar)
2. El ticket se marca como resuelto (server action existente)
3. El floating bar se **transforma** mostrando la encuesta inline (no desaparece)
4. Cada pregunta muestra 5 botones numerados con color coding (1-2 rojo/naranja, 3 amarillo, 4-5 verde)
5. Boton "Enviar encuesta" (primario) + "Omitir" (ghost)
6. Si omite: la encuesta queda pendiente, el floating bar desaparece
7. Si vuelve al ticket resuelto sin encuesta: aparece un **banner** invitandolo a completarla

### Condiciones
- Solo para tickets del area TSI (`slug === 'TSI'`)
- Solo el creador del ticket puede responder
- Solo cuando el ticket esta en estado `resolved`
- Una sola respuesta por ticket (constraint unique en ticketId)

### Pagina de resultados `/dashboard/encuestas`
- **Agentes**: ven solo encuestas de su area
- **Admin**: ve encuestas de todas las areas
- Instalar `recharts` para graficos
- **KPIs** en cards: promedio general, promedio por pregunta, tasa de respuesta, total encuestas
- **Graficos**: barras con distribucion de respuestas por pregunta (recharts)
- **Tabla**: codigo ticket, fecha, respuestas individuales, comentario
- Agregar "Encuestas" al menu de navegacion (agentes + admin)

### Cambios principales
1. Schema: nueva tabla `satisfaction_survey`
2. Server actions: `submitSurveyAction`, `getSurveyByTicket`, `getSurveyResults`
3. Componente: modificar `user-validation-controls.tsx` para transformar floating bar post-confirmacion
4. Componente: banner de encuesta pendiente en detalle de ticket resuelto
5. Pagina: `/dashboard/encuestas` con KPIs, graficos y tabla
6. Navegacion: agregar link "Encuestas" en sidebar para agentes y admin

### Verificacion
- `pnpm exec tsc --noEmit`
- `pnpm db:reset`
- UI: confirmar ticket TSI -> encuesta aparece -> completar/omitir -> ver resultados en /dashboard/encuestas

---

## Branch 4: `feat/user-manuals` - Manuales de Uso

### Contexto
Se necesitan 3 manuales accesibles desde el sidebar del dashboard como paginas internas.

### Documentos
1. `docs/manual-usuario.md` - Manual para usuarios finales
2. `docs/manual-agente.md` - Manual para agentes
3. `docs/manual-tecnico.md` - Manual tecnico del sistema

### Implementacion
1. Crear los 3 archivos markdown en `docs/`
2. Instalar `react-markdown` (o similar) para renderizar markdown en paginas
3. Crear pagina `/dashboard/manual/[slug]` que lea y renderice el markdown correspondiente
4. Sidebar: agregar links en seccion "Recursos" (Collapsible) segun rol:
   - **Usuario**: Manual de usuario
   - **Agente**: Manual de usuario + Manual de agente
   - **Admin**: Manual de usuario + Manual de agente + Manual tecnico
5. Los manuales se escriben DESPUES de implementar las 3 funcionalidades anteriores

### Verificacion
- `pnpm exec tsc --noEmit`
- UI: sidebar muestra manuales segun rol, paginas renderizan correctamente

---

## Orden de Implementacion

1. Branch 1: `feat/knowledge-base-config` (simple)
2. Branch 2: `feat/provider-priority` (simple)
3. Branch 3: `feat/satisfaction-survey` (compleja)
4. Branch 4: `feat/user-manuals` (post-implementacion)

Cada branch se verifica con `tsc --noEmit` y `db:reset`, y se presenta para aprobacion antes de merge a main.

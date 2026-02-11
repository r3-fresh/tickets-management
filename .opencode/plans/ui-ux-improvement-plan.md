# Plan de mejora UI/UX - Tickets Management

## Resumen

Extender el lenguaje de diseno del login (acromatico, limpio, tokens semanticos) a toda la aplicacion. 6 fases en branches separados.

## Principios

- **Cero cambios a datos**: Todo es CSS/JSX, no se toca BD ni server actions (excepto filtro de lectura en Fase 4)
- **Acromatico con tokens semanticos sutiles**: Colores muy desaturados para estados y prioridades
- **Tokens semanticos**: Reemplazar todos los colores hardcodeados
- **Componentes reutilizables**: Eliminar duplicacion

## Impacto en datos de produccion

| Fase | Toca BD? | Server actions? | Logica negocio? | Riesgo datos |
|------|----------|----------------|-----------------|-------------|
| 1 | No | No | No | CERO - solo CSS |
| 2 | No | No | No | CERO - componentes nuevos |
| 3 | No | No | No | CERO - solo clases CSS |
| 4 | No | No | Si (filtro lectura) | BAJO - solo cambia que se muestra |
| 5 | No | No | No | CERO - reemplazo componentes |
| 6 | No | No | No | CERO - solo presentacion |

---

## Fase 1: `ui/tokens-and-foundations` - Tokens y base visual

### Branch: `ui/tokens-and-foundations`

### Cambios especificos:

#### 1. Corregir font mismatch

**Archivo: `src/app/layout.tsx`**
```
// ANTES:
const inter = Inter({ subsets: ["latin"] });
// ...
<body className={inter.className}>

// DESPUES:
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// ...
<body className={`${inter.variable} font-sans`}>
```

**Archivo: `src/app/globals.css`**
```
// ANTES:
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);

// DESPUES:
--font-sans: var(--font-inter);
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

#### 2. Agregar tokens de estado (light mode - :root)

```css
/* Estado: Colores sutilmente desaturados */
--status-open: oklch(0.75 0.05 80);           /* hint ambar muy tenue */
--status-open-foreground: oklch(0.35 0.04 80); /* texto oscuro ambar */
--status-in-progress: oklch(0.75 0.04 250);           /* hint azul muy tenue */
--status-in-progress-foreground: oklch(0.35 0.04 250); /* texto oscuro azul */
--status-resolved: oklch(0.78 0.04 155);           /* hint verde muy tenue */
--status-resolved-foreground: oklch(0.32 0.04 155); /* texto oscuro verde */
--status-pending: oklch(0.78 0.05 95);           /* hint amarillo muy tenue */
--status-pending-foreground: oklch(0.35 0.04 95); /* texto oscuro amarillo */
--status-closed: oklch(0.92 0 0);             /* gris neutro */
--status-closed-foreground: oklch(0.45 0 0);  /* texto gris medio */
--status-voided: var(--destructive);           /* usa destructive existente */
--status-voided-foreground: oklch(0.35 0.08 25); /* texto rojo oscuro */
```

#### 3. Agregar tokens de estado (dark mode - .dark)

```css
--status-open: oklch(0.30 0.04 80);
--status-open-foreground: oklch(0.80 0.05 80);
--status-in-progress: oklch(0.30 0.03 250);
--status-in-progress-foreground: oklch(0.80 0.04 250);
--status-resolved: oklch(0.30 0.03 155);
--status-resolved-foreground: oklch(0.78 0.04 155);
--status-pending: oklch(0.30 0.04 95);
--status-pending-foreground: oklch(0.80 0.05 95);
--status-closed: oklch(0.25 0 0);
--status-closed-foreground: oklch(0.65 0 0);
--status-voided: var(--destructive);
--status-voided-foreground: oklch(0.80 0.06 25);
```

#### 4. Agregar tokens de prioridad (light mode - :root)

```css
/* Prioridad: Mas visibles que estados */
--priority-low: oklch(0.92 0 0);              /* gris suave */
--priority-low-foreground: oklch(0.45 0 0);
--priority-medium: oklch(0.82 0.06 80);       /* ambar visible */
--priority-medium-foreground: oklch(0.35 0.06 80);
--priority-high: oklch(0.78 0.08 55);         /* naranja claro */
--priority-high-foreground: oklch(0.30 0.08 55);
--priority-urgent: oklch(0.75 0.10 25);       /* rojo suave */
--priority-urgent-foreground: oklch(0.30 0.10 25);
```

#### 5. Agregar tokens de prioridad (dark mode - .dark)

```css
--priority-low: oklch(0.25 0 0);
--priority-low-foreground: oklch(0.65 0 0);
--priority-medium: oklch(0.30 0.05 80);
--priority-medium-foreground: oklch(0.82 0.06 80);
--priority-high: oklch(0.28 0.06 55);
--priority-high-foreground: oklch(0.80 0.08 55);
--priority-urgent: oklch(0.25 0.08 25);
--priority-urgent-foreground: oklch(0.82 0.10 25);
```

#### 6. Agregar mapeo en @theme inline

```css
/* En @theme inline, agregar: */
--color-status-open: var(--status-open);
--color-status-open-foreground: var(--status-open-foreground);
--color-status-in-progress: var(--status-in-progress);
--color-status-in-progress-foreground: var(--status-in-progress-foreground);
--color-status-resolved: var(--status-resolved);
--color-status-resolved-foreground: var(--status-resolved-foreground);
--color-status-pending: var(--status-pending);
--color-status-pending-foreground: var(--status-pending-foreground);
--color-status-closed: var(--status-closed);
--color-status-closed-foreground: var(--status-closed-foreground);
--color-status-voided: var(--status-voided);
--color-status-voided-foreground: var(--status-voided-foreground);

--color-priority-low: var(--priority-low);
--color-priority-low-foreground: var(--priority-low-foreground);
--color-priority-medium: var(--priority-medium);
--color-priority-medium-foreground: var(--priority-medium-foreground);
--color-priority-high: var(--priority-high);
--color-priority-high-foreground: var(--priority-high-foreground);
--color-priority-urgent: var(--priority-urgent);
--color-priority-urgent-foreground: var(--priority-urgent-foreground);
```

### Como validar Fase 1:
1. `pnpm build` - debe compilar sin errores
2. Abrir login en light y dark mode - debe verse identico al actual
3. Inspeccionar en DevTools > Computed > CSS Variables que las nuevas variables existen
4. No deberia haber cambios visuales (los tokens aun no se usan)

---

## Fase 2: `ui/shared-components` - Componentes reutilizables

### Branch: `ui/shared-components` (desde ui/tokens-and-foundations)

### Componentes a crear:

#### `src/components/shared/status-badge.tsx`
- Props: `status: string`, `className?: string`
- Usa tokens `bg-status-{status}` y `text-status-{status}-foreground`
- Forma: pill redondeado con borde sutil
- Traduce el status al espanol

#### `src/components/shared/priority-badge.tsx`
- Props: `priority: string`, `className?: string`
- Usa tokens `bg-priority-{level}` y `text-priority-{level}-foreground`
- Mas visible que el StatusBadge (los bordes son mas prominentes)

#### `src/components/shared/user-avatar.tsx`
- Props: `user: { name?: string, image?: string }`, `size?: "sm" | "md" | "lg"`, `className?: string`
- Fallback acromatico: `bg-muted-foreground/80 text-background`
- Elimina la necesidad de cyan-600, indigo-600, purple-to-pink

#### `src/lib/constants/ticket-display.ts`
- `getStatusConfig(status)` - retorna label, token key
- `getPriorityConfig(priority)` - retorna label, token key
- `translateStatus(status)` - traduccion
- `translatePriority(priority)` - traduccion (ya existe, centralizar)

### Como validar Fase 2:
1. `pnpm build` - debe compilar sin errores
2. No hay cambios visuales (componentes nuevos que aun no se usan)

---

## Fase 3: `ui/dashboard-layout` - Layout principal

### Branch: `ui/dashboard-layout` (desde ui/shared-components)

### Cambios en `src/app/dashboard/layout.tsx`:
- Linea 117: `bg-gray-100 dark:bg-background` -> `bg-muted`
- Linea 439: `bg-white dark:bg-card` -> `bg-card`
- Lineas 293-294: logout `text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20` -> `text-muted-foreground hover:text-foreground hover:bg-muted`
- Linea 427: mobile logout `text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30` -> `text-muted-foreground bg-muted hover:bg-accent`
- Linea 448: titulo mobile `text-lg font-bold` -> `text-base font-semibold`

### Como validar Fase 3:
1. Abrir dashboard en light mode y dark mode
2. Verificar sidebar expandido y colapsado en desktop
3. Probar en mobile (responsive con DevTools)
4. Verificar que el logout funciona (hacer click en cerrar sesion)
5. Comparar visualmente con el login

---

## Fase 4: `ui/dashboards-ux` - Mejoras UX en dashboards

### Branch: `ui/dashboards-ux` (desde ui/dashboard-layout)

### Cambios:

#### Filtrar tickets abiertos en dashboards
- `src/components/dashboards/user-dashboard.tsx`: Agregar filtro `status IN ('open', 'in_progress', 'pending_validation')` a queries de tickets recientes
- `src/components/dashboards/agent-dashboard.tsx`: Mismo filtro para tickets del area y tickets propios
- Las estadisticas siguen contando TODOS los tickets (no se filtran)

#### Stat cards acromaticos
- Reemplazar colores cromaticos (blue/amber/indigo/emerald/purple/cyan/rose) por variantes neutras:
  - Todos los iconos: `bg-muted text-muted-foreground`
  - Diferenciacion por peso visual (border sutil, opacidad del icono)

#### Avatar fallback
- Gradiente purple-pink -> `bg-muted-foreground text-background`

### NO altera datos. Solo cambia que se MUESTRA (lectura).

### Como validar Fase 4:
1. Login como user -> verificar que dashboard solo muestra tickets abiertos/en progreso
2. Login como agent -> verificar dashboard area y personal
3. Login como admin -> verificar dashboard general
4. Verificar que los numeros de las stat cards siguen correctos
5. Ir a "Mis tickets" (pagina completa) -> verificar que TODOS los tickets siguen ahi
6. Probar dark/light mode

---

## Fase 5: `ui/tickets-views` - Tablas y detalle de tickets

### Branch: `ui/tickets-views` (desde ui/dashboards-ux)

### Cambios:

#### tickets-list.tsx
- Status badges inline -> `<StatusBadge>`
- Priority `<Badge variant="outline">` -> `<PriorityBadge>` (mas colorido)
- Titulos: agregar `text-sm` para reducir peso
- Links: `text-blue-600` -> `text-foreground hover:underline`
- Avatars: bg-cyan-600/bg-indigo-600 -> `<UserAvatar>`
- `text-gray-500/400` -> `text-muted-foreground`
- Badge no leido: `bg-blue-500` -> `bg-foreground text-background`
- Solicitante: SIEMPRE visible (quitar condicional `isWatchedView`)

#### admin-tickets-table.tsx
- Mismos cambios que tickets-list.tsx
- Normalizar anchos de columnas

#### ticket detail page (src/app/dashboard/(shared)/tickets/[id]/page.tsx)
- Status badge inline -> `<StatusBadge>`
- Avatars -> `<UserAvatar>`

### Como validar Fase 5:
1. Abrir "Mis tickets" -> verificar columnas, prioridades visibles
2. Abrir "Explorador de tickets" (admin) -> comparar consistencia
3. Abrir ticket individual -> verificar badges, avatars, comentarios
4. Dark mode en todas las vistas
5. Verificar que prioridades son distinguibles de un vistazo
6. Verificar que el solicitante aparece en todas las tablas

---

## Fase 6: `ui/admin-and-forms` - Admin, formularios y polish

### Branch: `ui/admin-and-forms` (desde ui/tickets-views)

### Cambios:
- Formulario nuevo ticket: botones de prioridad con `<PriorityBadge>` estilo toggle
- Paginas error/loading: `bg-gray-50` -> tokens
- Admin tables (categorias, subcategorias, campus, areas): normalizar colores
- Agent config: normalizar colores
- Rich text editor: verificar consistencia
- Polish: hover states, focus rings, transiciones

### Como validar Fase 6:
1. Probar formulario nuevo ticket (llenar campos, NO enviar si no quieres ticket de prueba)
2. Probar tabs de configuracion del sistema (admin)
3. Forzar pagina de error (ruta inexistente)
4. Dark mode en todo

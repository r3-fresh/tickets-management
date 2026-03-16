# Manual de administrador

Este manual describe las funcionalidades exclusivas del rol de administrador en el sistema de gestión de tickets. Como administrador, tienes acceso a todas las funciones de usuario y agente, además de herramientas de configuración y supervisión del sistema completo.

---

## Rol del administrador

Un administrador es responsable de:

- Supervisar la operación general del sistema.
- Gestionar usuarios y asignar roles.
- Configurar áreas de atención, categorías, subcategorías y prioridades.
- Administrar proveedores por área.
- Controlar la disponibilidad del sistema (habilitar/deshabilitar creación de tickets).
- Consultar métricas y resultados de encuestas de satisfacción.

---

## Panel de control

El panel de control del administrador muestra una vista general del sistema:

- **Indicadores clave (KPIs):** Total de tickets, tickets abiertos, en progreso y resueltos.
- **Actividad del sistema:** Total de usuarios (desglosado por rol), comentarios/eventos registrados, áreas de atención activas y tickets anulados.
- **Usuarios recientes:** Los últimos 5 usuarios registrados con nombre, rol y fecha.
- **Áreas con más tickets:** Ranking de áreas por volumen de tickets recibidos.

---

## Explorador de tickets

La sección **"Explorador de tickets"** permite ver y buscar **todos los tickets del sistema**, sin importar el área, usuario o estado.

### Funcionalidades

- **Búsqueda:** Por código de ticket o título (búsqueda con retraso para no sobrecargar).
- **Filtros:** Por estado, usuario asignado, categoría, año y rango de fechas.
- **Tabla:** Muestra código, título, solicitante, prioridad, estado, agente asignado, cantidad de comentarios y fecha de creación.
- **Paginación:** Configurable por cantidad de elementos por página.
- **Acceso rápido:** Cada fila enlaza al detalle del ticket. También puedes copiar el enlace directo.

---

## Gestión de usuarios

Desde **"Gestión de usuarios"** puedes administrar todos los usuarios registrados en el sistema.

### Ver usuarios

La tabla muestra:

| Columna | Descripción |
|---|---|
| Avatar y nombre | Identificación visual del usuario |
| Correo | Correo institucional |
| Estado | Activo o inactivo |
| Rol | Usuario, agente o administrador |
| Área | Solo visible para agentes (área asignada) |

Puedes buscar usuarios por nombre o correo electrónico.

### Cambiar rol

1. Haz clic en el botón de edición de rol en la fila del usuario.
2. Selecciona el nuevo rol: **Usuario**, **Agente** o **Administrador**.
3. Si seleccionas **Agente**, se mostrará un campo adicional para asignar el **área de atención** (obligatorio).
4. Confirma el cambio.

> **Nota:** No puedes cambiar tu propio rol.

### Activar o desactivar usuarios

- Usa el interruptor en la fila del usuario para activar o desactivar su cuenta.
- Al desactivar un usuario, se muestra un diálogo de confirmación indicando que perderá acceso al sistema.
- El sistema registra quién desactivó la cuenta y en qué momento.
- No puedes desactivarte a ti mismo.

---

## Configuración del sistema

La página **"Configuración del sistema"** contiene 6 pestañas con todas las opciones de configuración.

### Pestaña: General

Controla ajustes globales del sistema:

- **Permitir crear nuevos tickets:** Interruptor para habilitar o deshabilitar la creación de tickets. Útil durante periodos de vacaciones o mantenimiento.
- **Mensaje de tickets deshabilitados:** Cuando la creación está deshabilitada, puedes personalizar el título y mensaje que verán los usuarios al intentar crear un ticket.
- **URL de base de conocimiento:** Define el enlace externo que aparece en el menú lateral bajo "Base de conocimiento > Enlace" para todos los usuarios.

> Todos los cambios se guardan automáticamente al salir del campo (no requiere botón de guardar).

### Pestaña: Categorías

Gestión de las categorías de tickets:

- **Tabla:** Nombre, área de atención asignada, descripción, cantidad de subcategorías, estado activo/inactivo.
- **Crear categoría:** Nombre, área de atención y descripción.
- **Editar categoría:** Modifica nombre, área, descripción o estado.
- **Eliminar categoría:** Con confirmación. Se advierte que también se eliminan las subcategorías asociadas.
- **Reordenar:** Usa los botones de subir/bajar para cambiar el orden de presentación.
- **Activar/desactivar:** Interruptor en cada fila para controlar la visibilidad de la categoría.

### Pestaña: Subcategorías

Gestión de subcategorías dentro de cada categoría:

- **Filtro por categoría:** Selecciona una categoría padre para ver sus subcategorías.
- **Tabla:** Orden, categoría padre, nombre, descripción, estado activo/inactivo.
- **Crear/editar/eliminar:** Similar a categorías, con campo adicional para seleccionar la categoría padre.
- **Reordenar:** Dentro de la misma categoría padre.

### Pestaña: Áreas de atención

Configuración de las áreas de atención del sistema:

- **Tabla:** Nombre del área, slug (identificador corto, ej: TSI, DIF, FED) y estado.
- **Crear/editar área:** Nombre, slug y opción de "Aceptar tickets" (si el área está activa para recibir tickets).
- Las áreas no se eliminan, solo se desactivan.

### Pestaña: Prioridades

Configuración de prioridades por área de atención:

- **Filtro por área:** Selecciona un área para ver sus prioridades.
- **Tabla:** Nivel de prioridad (baja, media, alta, urgente), descripción y tiempo de SLA.
- **Editar:** Modifica la descripción y las horas de SLA para cada nivel de prioridad.

> Los 4 niveles de prioridad son fijos. Solo puedes personalizar la descripción y el tiempo de SLA por cada área.

### Pestaña: Proveedores

Gestión de proveedores asociados a cada área:

- **Filtro por área:** Selecciona un área para ver sus proveedores.
- **Tabla:** Nombre del proveedor y estado activo/inactivo.
- **Crear proveedor:** Nombre (se asocia automáticamente al área seleccionada).
- **Editar proveedor:** Modificar nombre y estado.

---

## Encuestas de satisfacción

La sección **"Encuestas"** muestra los resultados de las encuestas de satisfacción que los usuarios completan cuando sus tickets de tipo TSI son resueltos.

### Lo que puedes ver

- **Indicadores generales:** Total de encuestas, promedio general y distribución por calificación.
- **Gráficos:** Distribución de respuestas para cada una de las 4 dimensiones evaluadas:
  - Tiempo de respuesta
  - Comunicación y orientación
  - Solución recibida
  - Satisfacción general
- **Tabla de detalle:** Todas las encuestas individuales con su ticket asociado, calificaciones y sugerencias.

---

## Acceso a funcionalidades de agente

Como administrador, también tienes acceso a todas las funciones de agente, aunque no aparezcan directamente en tu menú lateral. Puedes acceder a ellas por URL:

- **Tickets del área** (`/dashboard/area`): Ver tickets de cualquier área.
- **Proveedores** (`/dashboard/proveedores`): Gestionar tickets de proveedores.
- **Detalle de tickets:** Asignar tickets, cambiar estados, comentar, solicitar validación y derivar, igual que un agente.

---

## Manuales disponibles

Como administrador, tienes acceso a todos los manuales del sistema desde el menú lateral bajo **"Base de conocimiento"**:

| Manual | Descripción |
|---|---|
| Manual de usuario | Funciones básicas de creación y seguimiento de tickets |
| Manual de agente | Gestión de tickets del área, proveedores y configuración |
| Manual de administrador | Este manual (configuración del sistema y supervisión) |
| Manual técnico | Arquitectura, base de datos, despliegue y mantenimiento |

---

## Buenas prácticas

- **Revisa regularmente los usuarios:** Desactiva cuentas que ya no requieren acceso.
- **Mantén las categorías actualizadas:** Desactiva categorías o subcategorías obsoletas en lugar de eliminarlas.
- **Configura los SLAs:** Ajusta los tiempos de SLA por área según las necesidades reales.
- **Consulta las encuestas:** Usa los resultados para identificar áreas de mejora en el servicio.
- **Deshabilita tickets durante mantenimiento:** Usa la opción de configuración general para evitar confusión en los usuarios.

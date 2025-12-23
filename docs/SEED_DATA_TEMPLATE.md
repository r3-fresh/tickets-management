# Template de Seed Data

Este archivo te ayudará a preparar los datos iniciales para tu sistema de tickets.

---

## Instrucciones

Por favor, completa la información real de tu institución en cada sección. Los datos aquí definidos serán los que se cargarán al ejecutar `pnpm db:seed`.

---

## 1. Usuario Administrador Inicial

**Email del primer administrador**:
```
Email: fromeror@continental.edu.pe
Nota: Este usuario será creado automáticamente al hacer login con Google
```

---

## 2. Categorías de Tickets

Completa las categorías principales que usarás en tu sistema:

| # | Nombre de la Categoría | Descripción | Activa |
|---|------------------------|-------------|--------|
| 1 | Sistema de Gestión Bibliotecaria       | Problemas del sistema bibliotecario | Sí |
| 2 | Plataformas Web       | Problemas de las diferentes páginas de web | Sí |
| 3 | Sistematización y Reportería              | Problemas referentes a la reportería | Sí |

---

## 3. Subcategorías

Para cada categoría, define las subcategorías:

### Sistema de Gestión Bibliotecaria
| Subcategoría | Descripción |
|--------------|-------------|
| Catálogo en línea - Descubridor (Primo) | Problemas con el catálogo en línea |
| Autopréstamo | Problemas con el autopréstamo |
| Accesos/Permisos | Problemas con los accesos y permisos |

### Plataformas Web
| Subcategoría | Descripción |
|--------------|-------------|
| Repositorio Institucional | Problemas con el repositorio institucional |
| Sitio Web Hub de Información | Problemas con el sitio web de la institución |
| Sitio Web Fondo Editorial | Problemas con el sitio web de la institución |

### Sistematización y Reportería
| Subcategoría | Descripción |
|--------------|-------------|
| Automatización de proceso y/o archivo | Problemas con la automatización de procesos y/o archivos |
| Actualización y/o normalización de formularios | Problemas con la actualización y/o normalización de formularios |

---

## 4. Campus/Sedes

Lista todos los campus o sedes de tu institución:

| # | Nombre del Campus | Código | Activo |
|---|-------------------|--------|--------|
| 1 | Corporativo | COR | Sí |
| 2 | Huancayo | HYO | Sí |
| 3 | Los Olivos | LIM | Sí |
| 4 | Miraflores | MIR | Sí |
| 5 | Arequipa | AQP | Sí |
| 6 | Cusco | CUS | Sí |
| 7 | Instituto | ICC | Sí |
| 8 | Ica | ICA | Sí |
| 9 | Ayacucho | AYA | Sí |
| 10 | Virtual | VIR | Sí |

---

## 5. Áreas de Trabajo

Define las áreas o departamentos que gestionan tickets:

| # | Nombre del Área | Activa |
|---|-----------------|--------|
| 1 | Servicios presenciales | Sí |
| 2 | Servicios Virtuales | Sí |
| 3 | Apoyo a la investigación | Sí |
| 4 | Gestión de recursos de información | Sí |

---

## 6. Configuraciones Iniciales

| Configuración | Valor Inicial |
|---------------|---------------|
| Permitir crear nuevos tickets | Sí |
| Mensaje cuando tickets deshabilitados | Estamos en mantenimiento. Por favor, inténtelo más tarde. |

---

## 7. Usuarios de Prueba (Opcional)

Si deseas crear usuarios de prueba además del admin:

| Email | Nombre | Rol | Activo |
|-------|--------|-----|--------|
| | | | |

> **Nota**: Estos usuarios se crearán automáticamente al hacer login por primera vez con Google.

---

## 8. Datos Adicionales

### Prioridades por Defecto
Las prioridades están predefinidas:
- ✅ Baja (low)
- ✅ Media (medium)  
- ✅ Alta (high)
- ✅ Crítica (critical)

### Estados por Defecto
Los estados están predefinidos:
- ✅ Abierto (open)
- ✅ En progreso (in_progress)
- ✅ Resuelto (resolved)
- ✅ Cerrado (closed)

---

## Cómo Usar Este Template

1. **Completa esta información** con los datos reales de tu institución
2. **Comparte este archivo** conmigo
3. Actualizaré el script `/src/scripts/seed.ts` con tus datos
4. Ejecutarás `pnpm db:seed` para cargar la información

---
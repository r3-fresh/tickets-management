# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-01-31

### 🎉 Versión Inicial - Sistema de Gestión de Tickets

Primera versión estable del sistema de gestión de tickets con arquitectura moderna y optimizada.

### ✨ Características Principales

#### 🔐 Autenticación y Autorización
- Sistema de autenticación con Better Auth
- Soporte para múltiples providers (Google OAuth)
- Tres roles de usuario: `admin`, `agent`, `user`
- Protección de rutas mediante proxy.ts (Next.js 16)
- Gestión de sesiones segura

#### 🎫 Gestión de Tickets
- Creación, edición y seguimiento de tickets
- Sistema de estados: abierto, en progreso, resuelto, pendiente validación, anulado
- Prioridades: baja, normal, alta, crítica
- Asignación de tickets a agentes
- Comentarios en tiempo real con notificaciones
- Sistema de watchers para seguimiento
- Código único de ticket (formato: TKT-YYYYMMDD-XXXX)
- Contador de comentarios no leídos por usuario
- Vistas personalizadas por último acceso

#### 👥 Gestión de Usuarios (Admin)
- CRUD completo de usuarios
- Asignación de roles
- Asignación de áreas de atención a agentes
- Vista de usuarios recientes
- Estadísticas de usuarios por rol

#### 🏢 Áreas de Atención
- Creación y gestión de áreas de atención
- Asignación de agentes a áreas
- Vista de tickets por área
- Estadísticas de tickets por área

#### 📊 Dashboards Personalizados
- **Admin Dashboard**: Estadísticas globales del sistema
  - Total de tickets por estado
  - Usuarios por rol
  - Áreas más activas
  - Comentarios totales
  - Usuarios recientes
- **Agent Dashboard**: Vista de área y tickets personales
  - Tickets del área asignada
  - Tickets propios como usuario
  - Tickets en seguimiento
  - Estadísticas por estado
- **User Dashboard**: Vista personal
  - Tickets propios
  - Tickets en seguimiento
  - Estadísticas personales

#### 🎨 Interfaz de Usuario
- Diseño moderno con Tailwind CSS
- Componentes de shadcn/ui + Radix UI
- Modo claro/oscuro
- Diseño responsive
- Breadcrumbs de navegación
- Toasts de notificación con Sonner
- Skeleton loaders para mejor UX
- Error boundaries personalizados

#### 🗂️ Categorización
- Sistema de categorías y subcategorías
- Áreas geográficas (campus)
- Filtrado avanzado de tickets

### 🏗️ Arquitectura y Tecnología

#### Stack Principal
- **Framework**: Next.js 16.1.1 (App Router + Turbopack)
- **Lenguaje**: TypeScript en modo estricto
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **Autenticación**: Better Auth
- **Estilos**: Tailwind CSS
- **Validación**: Zod + React Hook Form
- **UI Components**: shadcn/ui + Radix UI
- **Iconos**: Lucide React
- **Package Manager**: pnpm

#### Características Técnicas
- Route Groups para organización por roles
- Server Actions para mutaciones
- Direct rendering sin redirects innecesarios
- Rate limiting en acciones críticas
- Manejo de errores robusto
- Validación de formularios en cliente y servidor
- SQL preparado para prevenir inyección
- Variables de entorno seguras

### 🚀 Performance

#### Optimizaciones Implementadas
- **Direct rendering**: Zero delay en dashboards (sin redirects)
- **Reducción de rutas**: De 27 a 15 rutas (-44%)
- **Componentes reutilizables**: Separación de lógica de negocio
- **Lazy loading**: Carga diferida de componentes pesados
- **Consultas optimizadas**: Uso eficiente de Drizzle ORM
- **Build time**: Optimizado con Turbopack

#### Métricas
- 15 rutas totales
- Build time: ~30 segundos
- Zero redirects en rutas principales
- TypeScript strict mode habilitado

### 🛡️ Seguridad

- Rate limiting en acciones críticas (10 req/min usuarios, 30 req/min admins)
- Validación con Zod en cliente y servidor
- Protección CSRF con Better Auth
- SQL injection prevention con Drizzle ORM
- Variables de entorno no commiteadas
- Sanitización de inputs de usuario
- Error handling sin exposición de detalles internos

### 📚 Documentación

- AGENTS.md: Guía completa para agentes de código
- README.md: Documentación del proyecto
- CHANGELOG.md: Registro de cambios
- Comentarios en español en código crítico
- JSDoc en funciones complejas

### 🗄️ Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Aplicación principal
│   │   ├── (admin)/      # Route group para admins
│   │   ├── (agent)/      # Route group para agentes
│   │   └── (shared)/     # Rutas compartidas
│   ├── login/            # Página de login
│   └── layout.tsx        # Layout raíz
├── actions/               # Server Actions
│   ├── admin/            # Acciones de admin
│   ├── agent/            # Acciones de agente
│   ├── tickets/          # Acciones de tickets
│   └── config/           # Configuración
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── shared/           # Compartidos
│   ├── admin/            # Específicos de admin
│   ├── agent/            # Específicos de agente
│   ├── tickets/          # Componentes de tickets
│   └── dashboards/       # Dashboards reutilizables
├── db/                    # Base de datos
│   ├── schema.ts         # Esquema Drizzle
│   └── index.ts          # Cliente DB
├── lib/                   # Utilidades
│   ├── auth/             # Helpers de auth
│   ├── email/            # Sistema de emails
│   ├── utils/            # Utilidades generales
│   ├── validation/       # Esquemas Zod
│   └── constants/        # Constantes
├── scripts/               # Scripts de utilidad
└── types/                 # Tipos TypeScript
```

### 📦 Scripts Disponibles

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm start            # Servidor de producción
pnpm lint             # Linter
pnpm setup            # Setup completo (install + db:push + db:seed)
pnpm db:push          # Sincronizar esquema con BD
pnpm db:seed          # Cargar datos iniciales
pnpm db:studio        # Abrir Drizzle Studio
pnpm db:reset         # Reset completo de BD
```

### 🐛 Bugs Conocidos

Ninguno reportado en la versión 1.0.0

### 🔄 Breaking Changes

Esta es la primera versión estable, no hay breaking changes.

### 📋 Notas de Migración

No aplica para v1.0.0

### 👥 Contribuidores

- r3-fresh - Desarrollo inicial y arquitectura

---

## [1.0.1] - 2026-01-31

### 📄 Documentación y Licencia

#### Changed
- **BREAKING**: Cambio de licencia de MIT a Propietaria
  - Uso personal y educativo: Gratuito
  - Uso comercial: Requiere licencia comercial pagada
  - Consultar LICENSE para términos completos
- Simplificación del README.md (de 450 a ~180 líneas, -60%)
  - Eliminadas secciones verbosas y redundantes
  - Foco en información esencial
  - Estructura más clara y concisa

#### Fixed
- Corregidas referencias a SMTP en .env.example (proyecto usa Gmail API)
- Cambiados emails específicos a ejemplos genéricos
- Actualizado badge de licencia en README (MIT → Proprietary)

---

## [Unreleased]

### Pendiente para futuras versiones
- Sistema de notificaciones push
- Dashboard analytics avanzado
- Exportación de reportes a PDF/Excel
- Integración con servicios externos (Slack, Teams)
- Sistema de plantillas para tickets recurrentes
- Historial de cambios en tickets (audit log)
- Búsqueda avanzada con filtros complejos
- Sistema de SLA (Service Level Agreement)
- Métricas de tiempo de respuesta

---

[1.0.1]: https://github.com/r3-fresh/tickets-management/releases/tag/v1.0.1
[1.0.0]: https://github.com/r3-fresh/tickets-management/releases/tag/v1.0.0

# 🎫 Sistema de Gestión de Tickets

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/r3-fresh/tickets-management/releases/tag/v1.0.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Sistema institucional de gestión de tickets construido con **Next.js 16**, **TypeScript**, **PostgreSQL** y **Better Auth**. Diseñado para gestionar solicitudes de soporte con dashboards personalizados por rol, arquitectura optimizada y zero delay.

---

## ✨ Características Principales

### 🔐 Autenticación y Autorización
- Sistema de autenticación con Better Auth
- Soporte para Google OAuth
- Tres roles de usuario: **Admin**, **Agent**, **User**
- Protección de rutas mediante proxy.ts (Next.js 16)
- Gestión de sesiones segura

### 🎫 Gestión de Tickets
- Creación, edición y seguimiento de tickets
- **Estados**: Abierto, En Progreso, Resuelto, Pendiente de Validación, Anulado
- **Prioridades**: Baja, Normal, Alta, Crítica
- Asignación de tickets a agentes y áreas
- Sistema de comentarios en tiempo real
- **Watchers**: Seguimiento de tickets de otros usuarios
- Código único de ticket (formato: `TKT-YYYYMMDD-XXXX`)
- Contador de comentarios no leídos por usuario
- Vistas personalizadas por último acceso

### 📊 Dashboards Personalizados
- **Admin Dashboard**: Estadísticas globales del sistema
  - Total de tickets por estado
  - Gestión de usuarios y roles
  - Áreas de atención más activas
  - Usuarios recientes
- **Agent Dashboard**: Vista de área y tickets personales
  - Tickets del área asignada
  - Tickets propios como usuario
  - Tickets en seguimiento
  - Estadísticas por estado
- **User Dashboard**: Vista personal
  - Tickets propios con estadísticas
  - Tickets en seguimiento
  - Resumen de estado de solicitudes

### 🎨 Interfaz Moderna
- Diseño moderno con **Tailwind CSS**
- Componentes de **shadcn/ui** + **Radix UI**
- Modo claro/oscuro
- Diseño 100% responsive
- Breadcrumbs de navegación
- Toasts de notificación con Sonner
- Skeleton loaders para mejor UX
- Error boundaries personalizados

### 🚀 Performance Optimizado
- ⚡ **Direct rendering**: Zero delay en dashboards (sin redirects)
- 📉 **Reducción de rutas**: 15 rutas limpias (-44% vs versión anterior)
- 🔄 **Componentes reutilizables**: Arquitectura limpia y mantenible
- 🏗️ **Route Groups**: Organización inteligente por roles
- ⚡ **Turbopack**: Build ultrarrápido de Next.js 16

### 🛡️ Seguridad
- Rate limiting en acciones críticas (10 req/min usuarios, 30 req/min admins)
- Validación con Zod en cliente y servidor
- Protección CSRF con Better Auth
- SQL injection prevention con Drizzle ORM
- Error handling robusto sin exposición de detalles internos

---

## 🏗️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| **Framework** | Next.js 16.1.1 (App Router + Turbopack) |
| **Lenguaje** | TypeScript (strict mode) |
| **Base de Datos** | PostgreSQL + Drizzle ORM |
| **Autenticación** | Better Auth |
| **Estilos** | Tailwind CSS |
| **Componentes UI** | shadcn/ui + Radix UI |
| **Validación** | Zod + React Hook Form |
| **Iconos** | Lucide React |
| **Package Manager** | pnpm |

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos

- **Node.js** v18 o superior
- **pnpm** (gestor de paquetes)
- **PostgreSQL** v14 o superior
- Proyecto en **Google Cloud Console** (para OAuth)

### 2. Instalación

```bash
# Clonar el repositorio
git clone https://github.com/r3-fresh/tickets-management.git
cd tickets-management

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
```

### 3. Configuración de Variables de Entorno

Edita `.env.local` con tus credenciales:

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/tickets_db"

# Better Auth (genera el secret con: openssl rand -base64 32)
BETTER_AUTH_SECRET="tu-secret-generado-aqui"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# CRON Job (opcional)
CRON_SECRET="secret-para-cron-jobs"

# Email SMTP (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password-de-aplicacion"
```

### 4. Setup de Base de Datos

```bash
# Setup completo (instalar + push schema + seed)
pnpm setup
```

Este comando:
- Sincroniza el esquema con PostgreSQL
- Carga datos iniciales (categorías, campus, áreas)

### 5. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 6. Configuración Inicial

1. Inicia sesión con Google OAuth
2. Promueve tu usuario a **Admin** ejecutando en PostgreSQL:
   ```sql
   UPDATE "user" SET role = 'admin' WHERE email = 'tu-email@dominio.com';
   ```
3. Accede al panel de administración en `/dashboard`

---

## 📦 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo (puerto 3000)
pnpm build            # Build de producción
pnpm start            # Servidor de producción
pnpm lint             # Ejecutar ESLint

# Base de Datos
pnpm setup            # Setup completo: install + db:push + db:seed
pnpm db:push          # Sincronizar esquema con BD (desarrollo)
pnpm db:seed          # Cargar datos iniciales
pnpm db:studio        # Abrir Drizzle Studio (interfaz visual)
pnpm db:reset         # ⚠️ DESTRUCTIVO: Borra todo y recrea la BD
pnpm db:drop          # Eliminar todas las tablas
```

---

## 🌍 Despliegue en Vercel

### Paso 1: Preparar Base de Datos en Neon

1. Crea una base de datos en [Neon](https://neon.tech)
2. Obtén la connection string (usa la versión con **pooling**)
3. Ejecuta las migraciones:
   ```bash
   DATABASE_URL="tu-connection-string-pooling" pnpm db:push
   DATABASE_URL="tu-connection-string-pooling" pnpm db:seed
   ```

### Paso 2: Configurar Variables de Entorno en Vercel

En el panel de Vercel, agrega:

**Base de Datos:**
- `DATABASE_URL` - Connection string de Neon con pooling

**Autenticación:**
- `BETTER_AUTH_SECRET` - Generar con `openssl rand -base64 32`
- `BETTER_AUTH_URL` - URL de producción (ej: `https://tu-app.vercel.app`)
- `NEXT_PUBLIC_APP_URL` - Misma URL de producción

**Google OAuth:**
- `GOOGLE_CLIENT_ID` - ID de cliente de Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - Secret de cliente de Google

**CRON Job:**
- `CRON_SECRET` - Secret para proteger el endpoint de CRON

**Email (Opcional):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### Paso 3: Configurar Google OAuth

En [Google Cloud Console](https://console.cloud.google.com):
1. Agrega la URI de redirección autorizada:
   ```
   https://tu-app.vercel.app/api/auth/callback/google
   ```

### Paso 4: Desplegar

1. Conecta tu repositorio en Vercel
2. Vercel detectará automáticamente Next.js
3. Haz clic en **Deploy**

### Paso 5: Verificación Post-Despliegue

1. Verifica que el login con Google funciona
2. Promover el primer usuario a administrador:
   ```sql
   UPDATE "user" SET role = 'admin' WHERE email = 'tu-email@dominio.com';
   ```
3. Verifica que el CRON job está activo (cierra tickets automáticamente cada hora)

> **Nota**: El archivo `vercel.json` configura el cierre automático de tickets que llevan más de 48 horas en estado "Pendiente de Validación".

---

## 🗂️ Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Better Auth endpoints
│   │   └── cron/         # CRON jobs
│   ├── dashboard/         # Aplicación principal
│   │   ├── (admin)/      # Route group para admins
│   │   ├── (agent)/      # Route group para agentes
│   │   └── (shared)/     # Rutas compartidas
│   ├── login/            # Página de login
│   └── layout.tsx        # Layout raíz
├── actions/               # Server Actions
│   ├── admin/            # Acciones de administrador
│   ├── agent/            # Acciones de agente
│   ├── tickets/          # Acciones de tickets
│   └── config/           # Configuración
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── shared/           # Componentes compartidos
│   ├── admin/            # Específicos de admin
│   ├── agent/            # Específicos de agente
│   ├── tickets/          # Componentes de tickets
│   └── dashboards/       # Dashboards reutilizables ⭐
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

---

## 🔐 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total, gestión de usuarios, áreas, categorías y visualización global de tickets |
| **Agent** | Gestión de tickets del área asignada, creación de tickets propios, seguimiento |
| **User** | Creación y seguimiento de tickets propios, seguimiento de tickets de otros |

---

## 📊 Características Técnicas Avanzadas

### Direct Rendering (Zero Delay)
- El dashboard principal (`/dashboard`) renderiza directamente el contenido según el rol
- **Antes**: Redirect → Delay visible → Página cargada
- **Ahora**: Renderizado instantáneo sin redirects

### Route Groups
- Organización inteligente por roles sin afectar las URLs
- Layouts con autorización centralizada
- URLs limpias sin exposición de roles

### Rate Limiting
```typescript
// Usuarios regulares: 10 req/min
createRateLimiter('MODERATE')

// Administradores: 30 req/min  
createRateLimiter('STRICT')
```

### Validación con Zod
```typescript
// Cliente y servidor comparten los mismos schemas
const ticketSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  priority: z.enum(['low', 'normal', 'high', 'critical'])
});
```

### Error Handling Robusto
- Error boundaries por route group
- Páginas de error personalizadas
- Not-found pages contextuales
- Logs sin exposición de detalles internos

---

## 📚 Documentación Adicional

- **[CHANGELOG.md](./CHANGELOG.md)** - Registro completo de cambios por versión
- **[AGENTS.md](./AGENTS.md)** - Guía completa para agentes de código AI
- **[LICENSE](./LICENSE)** - Licencia del proyecto

---

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor:
1. Verifica que no esté ya reportado en [Issues](https://github.com/r3-fresh/tickets-management/issues)
2. Crea un nuevo issue con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, navegador, versión de Node)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: agregar característica increíble'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

**Convenciones:**
- Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/)
- Código en español (comentarios, variables, funciones)
- TypeScript strict mode
- Mensajes de UI en español con capitalización de primera letra solamente

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework de React
- [Better Auth](https://www.better-auth.com/) - Sistema de autenticación
- [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript-first
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Vercel](https://vercel.com/) - Plataforma de deployment

---

## 📞 Soporte

Para preguntas y soporte:
- **Issues**: [GitHub Issues](https://github.com/r3-fresh/tickets-management/issues)
- **Documentación**: Ver archivos `.md` en el repositorio

---

**Hecho con ❤️ para gestión eficiente de tickets institucionales.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/r3-fresh/tickets-management)

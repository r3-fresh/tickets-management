# 🎫 Sistema de Gestión de Tickets

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

Sistema de gestión de tickets construido con **Next.js 16**, **TypeScript**, **PostgreSQL** y **Better Auth**. Diseñado para organizaciones que requieren gestión eficiente de solicitudes de soporte.

---

## ✨ Características Principales

- 🔐 **Autenticación**: Better Auth con Google OAuth
- 👥 **Roles**: Admin, Agent, User con permisos diferenciados
- 🎫 **Tickets**: Estados, prioridades, asignación y seguimiento
- 💬 **Comentarios**: Sistema en tiempo real con notificaciones
- 📊 **Dashboards**: Personalizados por rol con estadísticas
- 📧 **Emails**: Gmail API para notificaciones
- 🎨 **UI Moderna**: Tailwind CSS + shadcn/ui + modo oscuro
- ⚡ **Performance**: Direct rendering, zero delay
- 🛡️ **Seguridad**: Rate limiting, validación Zod, CSRF protection

---

## 🏗️ Stack Tecnológico

- **Framework**: Next.js 16.1.1 (App Router + Turbopack)
- **Lenguaje**: TypeScript (strict mode)
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **Autenticación**: Better Auth
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Validación**: Zod + React Hook Form
- **Package Manager**: pnpm

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js v18+
- pnpm
- PostgreSQL v14+
- Google Cloud Console project (OAuth)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/r3-fresh/tickets-management.git
cd tickets-management

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### Configuración (.env.local)

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/tickets_db"

# Better Auth (genera con: openssl rand -base64 32)
BETTER_AUTH_SECRET="tu-secret-generado"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Gmail API (para envío de emails)
GMAIL_REFRESH_TOKEN="tu-gmail-refresh-token"
EMAIL_FROM="tu-email@example.com"

# CRON Jobs
CRON_SECRET="secret-para-cron-jobs"
```

### Setup de Base de Datos

```bash
# Setup completo
pnpm setup
```

### Iniciar Aplicación

```bash
# Desarrollo
pnpm dev

# Producción
pnpm build
pnpm start
```

### Primer Usuario Admin

```sql
-- Ejecutar en PostgreSQL después del primer login
UPDATE "user" SET role = 'admin' WHERE email = 'tu-email@example.com';
```

---

## 📦 Scripts Disponibles

```bash
pnpm dev              # Desarrollo (puerto 3000)
pnpm build            # Build de producción
pnpm start            # Servidor de producción
pnpm lint             # ESLint

# Base de Datos
pnpm setup            # Setup completo
pnpm db:push          # Sincronizar esquema
pnpm db:seed          # Cargar datos iniciales
pnpm db:studio        # Drizzle Studio (UI)
pnpm db:reset         # Reset completo (⚠️ destructivo)
```

---

## 🌍 Deployment en Vercel

### 1. Base de Datos
Crea una base de datos en [Neon](https://neon.tech) y ejecuta:
```bash
DATABASE_URL="tu-connection-string" pnpm db:push
DATABASE_URL="tu-connection-string" pnpm db:seed
```

### 2. Variables de Entorno en Vercel
Configura las mismas variables de `.env.local` en el panel de Vercel.

### 3. Google OAuth
Agrega la redirect URI en Google Cloud Console:
```
https://tu-app.vercel.app/api/auth/callback/google
```

### 4. Deploy
Conecta el repositorio en Vercel y despliega.

### 5. Configuración Post-Deploy
```sql
-- Promover primer usuario a admin
UPDATE "user" SET role = 'admin' WHERE email = 'tu-email@example.com';
```

---

## 🔐 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Gestión completa: usuarios, áreas, categorías, todos los tickets |
| **Agent** | Gestión de tickets del área asignada + tickets propios |
| **User** | Creación y seguimiento de tickets propios |

---

## 📚 Documentación

- **[AGENTS.md](./AGENTS.md)** - Guía para agentes de código AI

---

## 📝 Licencia

Este proyecto está bajo una **licencia propietaria**. Ver [LICENSE](./LICENSE) para más detalles.

**Uso Comercial**: Requiere licencia comercial. Contactar al autor para más información.

---

## 👤 Autor

**r3-fresh**

Para consultas comerciales o licencias empresariales, contactar a través de GitHub.

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Better Auth](https://www.better-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

---

**Sistema de Gestión de Tickets** - © 2026 r3-fresh. Todos los derechos reservados.

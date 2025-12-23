# Sistema de Gestión de Tickets TSI

Sistema completo de gestión de tickets para instituciones educativas, construido con Next.js 15, TypeScript, y PostgreSQL.

## 🚀 Características

- ✅ **Autenticación con Google OAuth** (via Better Auth)
- ✅ **Gestión Completa de Tickets** (CRUD, asignación, prioridades, estados)
- ✅ **Sistema de Comentarios** con Rich Text Editor
- ✅ **Notificaciones en Tiempo Real**
- ✅ **Panel de Administración** completo
- ✅ **Gestión de Roles** (Admin/User) con activación/desactivación
- ✅ **Configuración Dinámica** (categorías, campus, áreas de trabajo)
- ✅ **Filtros Avanzados** (estado, categoría, año, búsqueda)
- ✅ **Watchers** para seguimiento de tickets
- ✅ **Modo Oscuro** incluido

---

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **pnpm** v8 o superior (recomendado)
- **PostgreSQL** v14 o superior
- Cuenta de **Google Cloud** para OAuth

---

## ⚡ Inicio Rápido

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd tickets-tsi
pnpm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales (ver [documentación de setup](./docs/SETUP.md))

### 3. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb tickets_tsi

# Ejecutar migraciones y seed
pnpm setup
```

### 4. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentación

- **[Setup Completo](./docs/SETUP.md)** - Guía paso a paso para deployment
- **[Database Schema](./docs/DATABASE.md)** - Documentación del schema y queries
- **[CRON Jobs](./docs/CRON_JOBS.md)** - Configuración de tareas programadas
- **[Seed Data Template](./docs/SEED_DATA_TEMPLATE.md)** - Template para datos iniciales

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Iniciar servidor desarrollo (con Turbopack)
pnpm build        # Build para producción
pnpm start        # Iniciar servidor producción
pnpm lint         # Verificar código

# Base de Datos
pnpm db:generate  # Generar migración desde schema.ts
pnpm db:migrate   # Aplicar migraciones
pnpm db:push      # Push directo (solo desarrollo)
pnpm db:studio    # Abrir Drizzle Studio
pnpm db:seed      # Ejecutar seed data
pnpm db:drop      # Eliminar todas las tablas (⚠️ cuidado!)
pnpm db:reset     # Drop + migrate + seed (reset completo)

# Setup Inicial
pnpm setup        # Install + migrate + seed (primer deploy)
```

---

## 🏗️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Componentes UI
- **TipTap** - Rich text editor
- **React Hook Form** + **Zod** - Formularios y validación

### Backend
- **Next.js API Routes** - API REST
- **Better Auth** - Autenticación con Google OAuth
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Base de datos relacional

### Utilidades
- **date-fns** - Manejo de fechas
- **Sonner** - Toast notifications
- **Lucide React** - Iconos

---

## 📁 Estructura del Proyecto

```
tickets-tsi/
├── docs/                      # Documentación
│   ├── SETUP.md
│   ├── DATABASE.md
│   ├── CRON_JOBS.md
│   └── SEED_DATA_TEMPLATE.md
├── drizzle/                   # Migraciones SQL
├── public/                    # Archivos estáticos
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Rutas de autenticación
│   │   ├── dashboard/        # Rutas protegidas
│   │   │   ├── tickets/      # Gestión de tickets
│   │   │   └── admin/        # Panel admin
│   │   ├── actions/          # Server actions
│   │   └── api/              # API routes
│   ├── components/           # Componentes React
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...              # Componentes personalizados
│   ├── db/                   # Base de datos
│   │   └── schema.ts        # Schema Drizzle
│   ├── lib/                  # Utilidades
│   │   ├── auth.ts          # Configuración Better Auth
│   │   ├── schemas/         # Zod schemas
│   │   └── utils/           # Helpers
│   └── scripts/             # Scripts de utilidad
│       ├── migrate.ts
│       ├── seed.ts
│       └── drop-db.ts
├── .env.example              # Template de variables
├── components.json           # shadcn/ui config
├── drizzle.config.ts        # Drizzle config
├── middleware.ts            # Next.js middleware
├── next.config.ts           # Next.js config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔐 Seguridad

- Autenticación OAuth con Google
- Roles de usuario (Admin/User)
- Middleware de protección de rutas
- Validación de datos con Zod
- SQL injection protection (Drizzle ORM)
- CSRF protection incluido

---

## 🚀 Deployment

### Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Conecta tu repositorio
2. Configura variables de entorno
3. Deploy automático

Ver [Setup Guide](./docs/SETUP.md#11-deployment-a-producción) para más detalles.

### Railway / Render

1. Crear servicio PostgreSQL
2. Crear servicio Web
3. Configurar variables de entorno
4. Ejecutar migraciones

---

## 👥 Roles y Permisos

### Usuario (user)
- Ver y crear tickets propios
- Comentar en tickets
- Observar tickets
- Ver estado de tickets

### Administrador (admin)
- Todo lo del usuario
- Ver todos los tickets
- Asignar tickets
- Gestionar categorías, campus, áreas
- Gestionar roles de usuarios
- Configurar sistema

---

## 🎯 Roadmap

- [ ] Notificaciones por email
- [ ] Dashboard con métricas
- [ ] Exportar reportes (PDF/Excel)
- [ ] Adjuntar archivos a tickets
- [ ] API pública con tokens
- [ ] Integración con Slack/Teams

---

## 🐛 Troubleshooting

Ver [Setup Guide - Troubleshooting](./docs/SETUP.md#troubleshooting)

---

## 📝 Licencia

Proyecto propietario para uso interno institucional.

---

## 🤝 Contribuir

Este es un proyecto interno. Para cambios mayores, contacta al equipo de desarrollo.

---

## 📬 Soporte

Para soporte técnico o preguntas:
- Revisar la [documentación](./docs/)
- Contactar al administrador del sistema

---

**Hecho con ❤️ para mejorar la gestión de tickets institucional**

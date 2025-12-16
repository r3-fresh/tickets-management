
# TSI Tickets - Sistema de Gestión de Tickets

Este proyecto es una aplicación Next.js para la gestión de tickets de soporte, utilizando las tecnologías más modernas y robustas.

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Shadcn/ui
- **Backend**: Server Actions
- **Base de Datos**: PostgreSQL (via Drizzle ORM)
- **Autenticación**: Better-Auth (Google OAuth)
- **Email**: Resend API

## Configuración y Puesta en Marcha

### 1. Variables de Entorno
Asegúrate de tener un archivo `.env.local` con las siguientes claves (basado en `.env.example`):

```env
DATABASE_URL="postgres://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000" # o tu dominio en producción
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
RESEND_API_KEY="..."
```

### 2. Base de Datos
Es crucial sincronizar el esquema con tu base de datos antes de iniciar.

```bash
# Sincronizar esquema
pnpm drizzle-kit push

# (Opcional) Poblar categorías iniciales
pnpm tsx src/scripts/seed-categories.ts
```

> **Nota:** Si usas Supabase y tienes problemas de conexión (ENETUNREACH), asegúrate de usar la cadena de conexión **IPv4** (usualmente puerto 6543 y pooler de transacciones/sesión) en lugar de la conexión directa IPv6.

### 3. Desarrollo Local

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Funcionalidades Implementadas

- **Autenticación**: Inicio de sesión con Google.
- **Roles**: Los usuarios son 'user' por defecto. El rol 'agent' debe asignarse manualmente en la DB por ahora.
- **Tickets**:
  - Creación con validación, categorías y subcategorías.
  - Listado de "Mis Tickets" para usuarios.
  - "Bandeja de Agentes" (visible en `/dashboard/agent`) para ver todos los casos.
  - Detalle de ticket con historial de comentarios.
- **Notificaciones**: Envío de correos automáticos al crear tickets (vía Resend).

## Despliegue en Vercel

1. Importar el repositorio en Vercel.
2. Configurar las variables de entorno en el panel de Vercel.
3. Desplegar.

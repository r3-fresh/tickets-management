# Sistema de Gestión de Tickets TSI

Sistema institucional de gestión de tickets construido con **Next.js 15**, **TypeScript**, **PostgreSQL** y **Better Auth**.

---

## 🚀 Inicio Rápido

### 1. Requisitos
- Node.js v18+ y pnpm.
- PostgreSQL v14+.
- Proyecto en Google Cloud Console (para OAuth).

### 2. Instalación
```bash
git clone <repository-url>
cd tickets-tsi
pnpm install
cp .env.example .env.local
```

### 3. Configuración de Base de Datos
```bash
# Crear base de datos y ejecutar todo el set inicial
pnpm setup
```

### 4. Ejecución
```bash
pnpm dev
```
Abre [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuración (.env.local)

Copia `.env.example` a `.env.local` y completa los siguientes bloques:

### Base de Datos
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/tickets_tsi"
```

### Better Auth & URL
Genera un secret con `openssl rand -base64 32`.
```env
BETTER_AUTH_SECRET="tu-secret-generado"
BETTER_AUTH_URL="http://localhost:3000" # Cambiar a tu dominio en producción
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Google OAuth
1. Crea credenciales en [Google Cloud Console](https://console.cloud.google.com).
2. Agrega `http://localhost:3000/api/auth/callback/google` a las URIs de redirección autorizadas.
```env
GOOGLE_CLIENT_ID="tu-id-de-cliente"
GOOGLE_CLIENT_SECRET="tu-secret-de-cliente"
```

### CRON & Email (Opcional)
```env
CRON_SECRET="secret-para-tareas-programadas"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email"
SMTP_PASS="tu-password-de-aplicacion"
```

---

## 🛠️ Comandos de Base de Datos

Utiliza los scripts preconfigurados en `package.json`:

- `pnpm setup`: Instala dependencias y prepara la BD por primera vez.
- `pnpm db:push`: Sincroniza el esquema con la base de datos (desarrollo).
- `pnpm db:seed`: Carga los datos iniciales (categorías, campus, áreas).
- `pnpm db:studio`: Abre Drizzle Studio, una interfaz visual para explorar los datos.
- `pnpm db:reset`: Borra todo, aplica el esquema y carga los datos de nuevo (⚠️ Destructivo).

---

## 🌍 Despliegue en Vercel

### Paso 1: Preparar Base de Datos en Neon

1. Crea una base de datos en [Neon](https://neon.tech)
2. Obtén la connection string (usa la versión con **pooling**)
3. Ejecuta las migraciones localmente apuntando a producción:
   ```bash
   DATABASE_URL="tu-connection-string-pooling" pnpm db:push
   DATABASE_URL="tu-connection-string-pooling" pnpm db:seed
   ```

### Paso 2: Configurar Variables de Entorno en Vercel

En el panel de Vercel, configura las siguientes variables:

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
- `SMTP_HOST` - Servidor SMTP (ej: `smtp.gmail.com`)
- `SMTP_PORT` - Puerto SMTP (ej: `587`)
- `SMTP_USER` - Usuario de email
- `SMTP_PASS` - Contraseña de aplicación

### Paso 3: Configurar Google OAuth

En [Google Cloud Console](https://console.cloud.google.com):
1. Agrega la URI de redirección autorizada:
   ```
   https://tu-app.vercel.app/api/auth/callback/google
   ```

### Paso 4: Desplegar

1. Conecta tu repositorio en Vercel
2. Vercel detectará automáticamente Next.js
3. Despliega

### Paso 5: Verificación Post-Despliegue

1. Verifica que el login con Google funciona
2. Promover el primer usuario a administrador:
   ```sql
   UPDATE "user" SET role = 'admin' WHERE email = 'tu-email@continental.edu.pe';
   ```
3. Verifica que el CRON job está activo en el panel de Vercel
4. Prueba crear y gestionar tickets

> **Nota sobre CRON Jobs**: El archivo `vercel.json` configura el cierre automático de tickets cada hora. El endpoint `/api/cron/auto-close-tickets` cierra automáticamente los tickets que llevan más de 48 horas en estado "Pendiente de Validación".

---

## 🔐 Roles y Seguridad

- **Admin**: Acceso total, gestión de categorías, roles y visualización global.
- **User**: Creación y seguimiento de tickets propios.
- **Seguridad**: Protección de rutas via Middleware, validación Zod y protección contra inyección SQL activa.

---

**Hecho con ❤️ para la gestión institucional.**

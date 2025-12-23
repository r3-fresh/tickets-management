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

- `pnpm db:push`: Sincroniza el esquema con la base de datos (desarrollo).
- `pnpm db:seed`: Carga los datos iniciales (categorías, campus, áreas).
- `pnpm db:studio`: Abre una interfaz visual para explorar los datos.
- `pnpm db:reset`: Borra todo, aplica el esquema y carga los datos de nuevo (⚠️ Destructivo).
- `pnpm setup`: Instala dependencias y prepara la BD por primera vez.

---

## 🌍 Despliegue en Vercel

### 1. Variables de Entorno
Configura todas las variables de `.env.local` en el panel de Vercel. Asegúrate de actualizar `BETTER_AUTH_URL` y `NEXT_PUBLIC_APP_URL` con tu dominio real.

### 2. CRON Job (Cierre Automático)
El proyecto incluye un archivo `vercel.json` que configura el cierre automático de tickets cada hora.
- Endpoint: `/api/cron/auto-close-tickets`
- Requiere: `CRON_SECRET` configurado en Vercel.

### 3. Base de Datos
Si usas Neon (recomendado), usa el pooling URL en `DATABASE_URL`. Ejecuta `pnpm setup` localmente apuntando a la BD de producción o vía un script de deployment.

---

## 🔐 Roles y Seguridad

- **Admin**: Acceso total, gestión de categorías, roles y visualización global.
- **User**: Creación y seguimiento de tickets propios.
- **Seguridad**: Protección de rutas via Middleware, validación Zod y protección contra inyección SQL activa.

---

**Hecho con ❤️ para la gestión institucional.**

# Setup Guide - Sistema de Gestión de Tickets

Esta guía te ayudará a configurar el sistema desde cero en un nuevo ambiente.

---

## Requisitos Previos

### Software Necesario
- **Node.js** v18 o superior
- **pnpm** v8 o superior (recomendado) o npm
- **PostgreSQL** v14 o superior
- **Git** para clonar el repositorio

### Servicios Externos
- **Cuenta de Google Cloud** (para OAuth)
- **Servidor SMTP** (opcional, para notificaciones por email)

---

## 1. Configuración Inicial

### Clonar el Repositorio
```bash
git clone <repository-url>
cd tickets-tsi
```

### Instalar Dependencias
```bash
pnpm install
```

---

## 2. Base de Datos

### Crear Base de Datos PostgreSQL
```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE tickets_tsi;

-- Crear usuario (opcional)
CREATE USER tickets_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tickets_tsi TO tickets_user;
```

### Configurar Conexión

Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

Edita `.env.local` y configura:
```env
DATABASE_URL="postgresql://tickets_user:your_password@localhost:5432/tickets_tsi"
```

---

## 3. Configuración de Better Auth

### Generar Secret
```bash
# Generar un string aleatorio seguro
openssl rand -base64 32
```

### Agregar a .env.local
```env
BETTER_AUTH_SECRET="<resultado del comando anterior>"
BETTER_AUTH_URL="http://localhost:3000"  # En desarrollo
# BETTER_AUTH_URL="https://tu-dominio.com"  # En producción
```

---

## 4. Configuración de Google OAuth

### Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs & Services" > "Credentials"

### Configurar OAuth 2.0

1. Click en "Create Credentials" > "OAuth client ID"
2. Tipo de aplicación: **Web application**
3. Nombre: `Tickets TSI`
4. **Authorized JavaScript origins**:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`
5. **Authorized redirect URIs**:
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://tu-dominio.com/api/auth/callback/google`

### Agregar Credenciales a .env.local
```env
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
```

---

## 5. Variables de Entorno Completas

Revisa que tu `.env.local` tenga todas las variables necesarias:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Better Auth
BETTER_AUTH_SECRET="<generated-secret>"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="<your-client-id>"
GOOGLE_CLIENT_SECRET="<your-client-secret>"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (Opcional - para notificaciones)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@tu-dominio.com"

# Cron Jobs (Opcional)
CRON_SECRET="<another-random-secret>"
```

---

## 6. Ejecutar Migraciones

### Aplicar Schema a la Base de Datos
```bash
pnpm db:migrate
```

Este comando ejecutará todas las migraciones SQL en orden y creará las tablas necesarias.

---

## 7. Seed Data Inicial

### Ejecutar Script de Seed
```bash
pnpm db:seed
```

Este comando creará:
- Usuario administrador inicial
- Categorías base
- Campus predefinidos
- Áreas de trabajo
- Configuraciones del sistema

> **Nota**: Edita `/src/scripts/seed.ts` antes de ejecutar para personalizar los datos iniciales según tu institución.

---

## 8. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

El servidor estará disponible en: `http://localhost:3000`

---

## 9. Primer Acceso

### Iniciar Sesión como Admin

1. Abre `http://localhost:3000`
2. Haz clic en "Sign in with Google"
3. Usa la cuenta de Google configurada como admin en el seed

**Por defecto** el primer usuario que se registre será automáticamente admin, o puedes configurarlo manualmente en la base de datos:

```sql
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'tu-email@dominio.com';
```

---

## 10. Configuración Inicial del Sistema

### Desde el Panel Admin

1. **Configuración** (`/dashboard/admin/settings`)
   - Configura si se permiten nuevos tickets
   - Personaliza mensaje cuando tickets están deshabilitados

2. **Gestión de Roles** (`/dashboard/admin/roles`)
   - Asigna roles a usuarios
   - Activa/desactiva usuarios

3. **Categorías** (`/dashboard/admin/settings` > pestaña Categorías)
   - Revisa y ajusta categorías
   - Agrega subcategorías necesarias

4. **Campus y Áreas** (`/dashboard/admin/settings` > pestañas respectivas)
   - Verifica campus
   - Ajusta áreas de trabajo

---

## 11. Deployment a Producción

### Preparación

1. **Variables de Entorno**
   ```bash
   # Actualizar en tu hosting
   BETTER_AUTH_URL="https://tu-dominio.com"
   NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
   DATABASE_URL="<produccion-database-url>"
   ```

2. **Build de Producción**
   ```bash
   pnpm build
   ```

3. **Ejecutar Migraciones**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

### Plataformas Recomendadas

#### Vercel (Recomendado para Next.js)
1. Conecta tu repositorio
2. Configura variables de entorno
3. Deploy automático

#### Railway / Render
1. Crear servicio PostgreSQL
2. Crear servicio Web
3. Configurar variables
4. Deploy

---

## 12. Comandos Útiles

```bash
# Desarrollo
pnpm dev                    # Iniciar servidor desarrollo
pnpm build                  # Build para producción
pnpm start                  # Iniciar servidor producción

# Base de Datos
pnpm db:generate           # Generar migración desde schema
pnpm db:migrate            # Aplicar migraciones
pnpm db:push              # Push directo (solo desarrollo)
pnpm db:studio            # Abrir Drizzle Studio
pnpm db:seed              # Ejecutar seed data

# Utilidades
pnpm lint                 # Verificar código
pnpm type-check          # Verificar TypeScript
```

---

## Troubleshooting

### Error de Conexión a la Base de Datos
```
Error: Connection refused
```
**Solución**: Verifica que PostgreSQL esté corriendo y la URL sea correcta.

### Error de Migración
```
Error: relation "user" already exists
```
**Solución**: La base de datos ya tiene tablas. Puedes:
1. Eliminar la base de datos y crearla de nuevo
2. Usar `pnpm db:push` en desarrollo para sincronizar

### Error de Google OAuth
```
Error: redirect_uri_mismatch
```
**Solución**: Verifica que las URIs de redirect en Google Console coincidan exactamente con tu configuración.

### Usuario no es Admin
```sql
-- Promover usuario a admin manualmente
UPDATE "user" 
SET role = 'admin', is_active = true
WHERE email = 'admin@example.com';
```

---

## Seguridad en Producción

### Checklist de Seguridad

- [ ] Variables de entorno seguras (no en repositorio)
- [ ] `BETTER_AUTH_SECRET` único y complejo
- [ ] HTTPS habilitado
- [ ] Database con credenciales fuertes
- [ ] Backups automáticos configurados
- [ ] Rate limiting habilitado
- [ ] Logs de errores monitoreados

---

## Mantenimiento

### Backups de Base de Datos
```bash
# Backup
pg_dump -U tickets_user tickets_tsi > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U tickets_user tickets_tsi < backup_20231222.sql
```

### Actualizaciones
```bash
git pull
pnpm install
pnpm db:migrate
pnpm build
pnpm start
```

---

## Soporte

Para problemas o preguntas:
- Revisa la documentación en `/docs`
- Consulta los logs del servidor
- Verifica variables de entorno

---

**¡Sistema listo para usar!** 🎉

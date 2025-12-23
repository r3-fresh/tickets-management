# Configuración de CRON Jobs

Este documento describe la configuración de tareas programadas (CRON jobs) para el sistema de gestión de tickets.

---

## Tareas Programadas del Sistema

### 1. Limpieza de Sesiones Expiradas

**Descripción**: Elimina sesiones vencidas de la base de datos.

**Frecuencia**: Diaria a las 2:00 AM

**Endpoint**: `/api/cron/cleanup-sessions`

**Configuración**:
```bash
0 2 * * * curl -X POST https://tu-dominio.com/api/cron/cleanup-sessions \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

**Variables de entorno necesarias**:
```env
CRON_SECRET="tu-secret-aleatorio-seguro"
```

---

### 2. Notificaciones de Tickets Pendientes

**Descripción**: Envía recordatorios de tickets abiertos sin respuesta.

**Frecuencia**: Cada lunes a las 9:00 AM

**Endpoint**: `/api/cron/notify-pending-tickets`

**Configuración**:
```bash
0 9 * * 1 curl -X POST https://tu-dominio.com/api/cron/notify-pending-tickets \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

### 3. Reportes Semanales

**Descripción**: Genera reporte semanal de actividad y lo envía por email.

**Frecuencia**: Viernes a las 5:00 PM

**Endpoint**: `/api/cron/weekly-report`

**Configuración**:
```bash
0 17 * * 5 curl -X POST https://tu-dominio.com/api/cron/weekly-report \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

## Configuración por Plataforma

### Vercel

Vercel no soporta CRON jobs tradicionales, pero puedes usar:

#### Opción 1: Vercel Cron Jobs (Recomendado)

Crea `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-sessions",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/notify-pending-tickets",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 17 * * 5"
    }
  ]
}
```

#### Opción 2: GitHub Actions

Crea `.github/workflows/cron-jobs.yml`:
```yaml
name: Scheduled Tasks

on:
  schedule:
    - cron: '0 2 * * *'  # Limpieza diaria
    - cron: '0 9 * * 1'  # Notificaciones semanales
    - cron: '0 17 * * 5' # Reportes semanales

jobs:
  run-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup Sessions
        if: github.event.schedule == '0 2 * * *'
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/cleanup-sessions \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
      
      - name: Notify Pending Tickets
        if: github.event.schedule == '0 9 * * 1'
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/notify-pending-tickets \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
      
      - name: Weekly Report
        if: github.event.schedule == '0 17 * * 5'
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/weekly-report \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

### Railway / VPS Tradicional

En un VPS con acceso a crontab:

```bash
# Editar crontab
crontab -e

# Agregar estas líneas
0 2 * * * curl -X POST https://tu-dominio.com/api/cron/cleanup-sessions -H "Authorization: Bearer TU_CRON_SECRET"
0 9 * * 1 curl -X POST https://tu-dominio.com/api/cron/notify-pending-tickets -H "Authorization: Bearer TU_CRON_SECRET"
0 17 * * 5 curl -X POST https://tu-dominio.com/api/cron/weekly-report -H "Authorization: Bearer TU_CRON_SECRET"
```

---

### EasyCron / Servicio Externo

Si usas un servicio de CRON externo:

1. Crea cuenta en [EasyCron](https://www.easycron.com) o similar
2. Agrega los endpoints con sus horarios
3. Configura el header de autorización

**Ejemplo de configuración**:
- URL: `https://tu-dominio.com/api/cron/cleanup-sessions`
- Method: POST
- Headers: `Authorization: Bearer TU_CRON_SECRET`
- Schedule: `0 2 * * *`

---

## Implementación de Endpoints

Los endpoints de CRON deben estar en `/src/app/api/cron/`:

### Estructura de un Endpoint de CRON

```typescript
// /src/app/api/cron/cleanup-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { lt } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  // Verificar autorización
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Ejecutar tarea
    const result = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()));

    console.log('[CRON] Sessions cleaned:', result.rowCount);

    return NextResponse.json({
      success: true,
      cleaned: result.rowCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

---

## Monitoreo

### Logs de Ejecución

Los logs de cada CRON job se pueden monitorear:

```typescript
// Agregar logs a cada endpoint
console.log('[CRON]', {
  job: 'cleanup-sessions',
  timestamp: new Date().toISOString(),
  result: 'success',
  details: { cleaned: 10 }
});
```

### Notificaciones de Fallos

Implementar notificación si un CRON falla:

```typescript
// En caso de error
await sendAdminNotification({
  type: 'cron_failure',
  job: 'cleanup-sessions',
  error: error.message
});
```

---

## Testing de CRON Jobs

### Desarrollo Local

```bash
# Test manual del endpoint
curl -X POST http://localhost:3000/api/cron/cleanup-sessions \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Verificar Respuesta

```json
{
  "success": true,
  "cleaned": 5,
  "timestamp": "2025-12-22T20:00:00.000Z"
}
```

---

## Seguridad

### Mejores Prácticas

1. **Usar Header de Autorización**: Nunca exponer endpoints sin auth
2. **Rotar CRON_SECRET**: Cambiar periódicamente
3. **Rate Limiting**: Limitar intentos fallidos
4. **Logs Auditables**: Registrar todas las ejecuciones
5. **Timeouts**: Configurar timeouts apropiados

### Ejemplo de Verificación Segura

```typescript
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  // Verificación en tiempo constante
  return crypto.timingSafeEqual(
    Buffer.from(token || ''),
    Buffer.from(process.env.CRON_SECRET || '')
  );
}
```

---

## Variables de Entorno

Agregar en `.env.local` y en tu plataforma de deployment:

```env
# CRON Configuration
CRON_SECRET="genera-un-secret-aleatorio-seguro-aqui"

# Email para reportes (si aplica)
ADMIN_EMAIL="admin@tudominio.com"
```

---

## Troubleshooting

### CRON no se ejecuta

1. Verificar logs de la plataforma
2. Verificar sintaxis de CRON schedule
3. Verificar que el endpoint responda manualmente
4. Verificar CRON_SECRET sea correcto

### Errores 401 Unauthorized

- Verificar header de autorización
- Verificar CRON_SECRET en variables de entorno
- Verificar formato: `Bearer ${SECRET}`

### Timeouts

- Optimizar query de la tarea
- Aumentar timeout en configuración de plataforma
- Dividir tarea en sub-tareas más pequeñas

---

**Configuración lista para usar en producción**

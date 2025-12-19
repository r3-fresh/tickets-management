# Auto-Closure Cron Job Setup

## Endpoint
`GET /api/cron/auto-close-tickets`

## Descripción
Este endpoint cierra automáticamente los tickets que han estado en estado "Pendiente de Validación" por más de 48 horas.

## Autenticación
Requiere un token secreto en el header `Authorization`:
```
Authorization: Bearer <CRON_SECRET>
```

## Variable de Entorno Requerida
Agrega a tu `.env.local`:
```bash
CRON_SECRET=tu-secreto-super-seguro-aqui
```

## Configuración en Vercel

### Opción 1: Vercel Cron Jobs (Recomendado)

1. Crea el archivo `vercel.json` en la raíz del proyecto:

```json
{
  "crons": [{
    "path": "/api/cron/auto-close-tickets",
    "schedule": "0 * * * *"
  }]
}
```

Este schedule ejecuta el cron cada hora (minuto 0).

2. Asegúrate de que `CRON_SECRET` esté configurado en Vercel:
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega `CRON_SECRET` con un valor seguro

3. Redeploy tu aplicación

**Nota**: Los Vercel Cron Jobs solo funcionan en producción, no en desarrollo local.

### Opción 2: Cron-job.org (Alternativa)

Si no usas Vercel, puedes usar un servicio externo:

1. Ve a [cron-job.org](https://cron-job.org/)
2. Crea una cuenta
3. Añade un nuevo cron job:
   - URL: `https://tu-dominio.com/api/cron/auto-close-tickets`
   - Schedule: Cada hora (0 * * * *)
   - Headers: `Authorization: Bearer tu-secreto`

## Prueba Manual

Para probar el endpoint manualmente:

```bash
curl -X GET https://tu-dominio.com/api/cron/auto-close-tickets \
  -H "Authorization: Bearer tu-secreto"
```

O en local:

```bash
curl -X GET http://localhost:3000/api/cron/auto-close-tickets \
  -H "Authorization: Bearer tu-secreto"
```

## Respuesta del Endpoint

### Éxito (sin tickets para cerrar):
```json
{
  "success": true,
  "message": "No tickets to auto-close",
  "count": 0
}
```

### Éxito (tickets cerrados):
```json
{
  "success": true,
  "message": "Successfully auto-closed 3 ticket(s)",
  "count": 3,
  "closedTickets": [
    {
      "id": 1,
      "code": "2025-0001",
      "validationRequestedAt": "2025-12-17T10:00:00.000Z"
    }
  ]
}
```

### Error de autenticación:
```json
{
  "error": "Unauthorized"
}
```

## Logs

Los tickets cerrados automáticamente se registran en los logs de consola:
```
Auto-closed 3 tickets: ['2025-0001', '2025-0002', '2025-0003']
```

## Seguridad

⚠️ **IMPORTANTE**: Nunca compartas el `CRON_SECRET` en el código ni en repositorios públicos.

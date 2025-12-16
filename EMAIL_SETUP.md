# Configuración de Notificaciones por Email (Resend)

## Estado Actual

El código para enviar correos electrónicos está implementado en:
- [`src/lib/email.ts`](file:///home/r3-fresh/projects/tickets-tsi/src/lib/email.ts) - Utilidad de envío
- [`src/app/actions/ticket-actions.ts`](file:///home/r3-fresh/projects/tickets-tsi/src/app/actions/ticket-actions.ts) - Envío al crear ticket
- [`src/app/actions/agent-actions.ts`](file:///home/r3-fresh/projects/tickets-tsi/src/app/actions/agent-actions.ts) - Envío al cambiar estado

## ¿Por qué no se envían correos?

**Falta configurar la API Key de Resend en `.env.local`**

## Pasos para Configurar Resend

### 1. Crear Cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Regístrate con tu email
3. Verifica tu cuenta

### 2. Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Click en **Create API Key**
3. Dale un nombre (ej: "TSI Tickets Dev")
4. Copia la API Key (empieza con `re_`)

### 3. Agregar a `.env.local`

```bash
RESEND_API_KEY="re_tu_api_key_aqui"
EMAIL_FROM="Soporte TSI <onboarding@resend.dev>"
```

> **Nota**: En el plan gratuito de Resend, solo puedes enviar desde `onboarding@resend.dev` a tu email verificado.

### 4. Verificar tu Dominio (Opcional - Producción)

Para enviar desde tu propio dominio (ej: `soporte@continental.edu.pe`):

1. En Resend, ve a **Domains**
2. Click en **Add Domain**
3. Ingresa tu dominio
4. Agrega los registros DNS que te proporciona Resend
5. Espera la verificación
6. Actualiza `EMAIL_FROM` en `.env.local`:

```bash
EMAIL_FROM="Soporte TSI <soporte@continental.edu.pe>"
```

## Limitaciones del Plan Gratuito

- **100 emails/día**
- Solo puedes enviar a emails verificados
- Solo desde `onboarding@resend.dev`

Para producción, necesitarás:
- Verificar tu dominio
- Upgrade a plan de pago si necesitas más de 100 emails/día

## Probar el Envío

### 1. Verificar tu Email en Resend

1. Ve a **Settings** → **Verified Emails**
2. Agrega tu email de prueba
3. Verifica el email que te envían

### 2. Crear un Ticket de Prueba

1. Inicia sesión en la app
2. Crea un nuevo ticket
3. Revisa tu bandeja de entrada

### 3. Revisar Logs

Si no llega el correo, revisa la terminal donde corre `pnpm dev`:

```bash
# Si ves esto, falta la API Key
⚠️ RESEND_API_KEY is missing. Email not sent

# Si ves esto, hay un error de Resend
Resend API Error: { ... }
```

## Correos que se Envían

### Al Crear Ticket
- **Para**: Usuario que crea el ticket
- **CC**: Emails en el campo CC
- **Asunto**: `Ticket Creado #[ID]: [Título]`
- **Contenido**: Confirmación de creación

### Al Cambiar Estado (Solo Admins)
- **Para**: Creador del ticket
- **Asunto**: `Actualización de Ticket #[ID]`
- **Contenido**: Nuevo estado del ticket

**Estados que envían correo**:
- `in_progress` → "Tu ticket está siendo atendido"
- `resolved` → "Tu ticket ha sido resuelto"
- `voided` → "Tu ticket ha sido anulado"

## Troubleshooting

### No llegan correos

1. ✅ Verifica que `RESEND_API_KEY` esté en `.env.local`
2. ✅ Reinicia el servidor (`pnpm dev`)
3. ✅ Verifica que tu email esté verificado en Resend
4. ✅ Revisa la consola/terminal por errores
5. ✅ Revisa spam/promociones

### Error "Invalid API Key"

- La API Key es incorrecta o expiró
- Genera una nueva en Resend

### Error "Email not verified"

- En plan gratuito, solo puedes enviar a emails verificados
- Verifica tu email en Resend Dashboard

## Alternativas a Resend

Si prefieres usar otro servicio:

### Gmail SMTP (Requiere App Password)
- Más complejo de configurar
- Límite de 500 emails/día
- Requiere habilitar 2FA y generar App Password

### SendGrid
- 100 emails/día gratis
- Similar a Resend

### Amazon SES
- Muy económico
- Más complejo de configurar

# Configuración de Códigos OTP para Recuperación de Contraseña

Este sistema envía códigos OTP de 6 dígitos directamente por email, sin necesidad de links.

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Supabase (requerido)
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Email - Opción 1: SMTP Genérico
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
EMAIL_FROM=Phoebe App <noreply@phoebe.app>

# Email - Opción 2: Gmail (más simple)
# GMAIL_USER=tu_email@gmail.com
# GMAIL_APP_PASSWORD=tu_gmail_app_password

# Backend Port
PORT=4000
```

### 2. Configurar Gmail (Recomendado para desarrollo)

**IMPORTANTE:** Necesitas tener la **Verificación en 2 pasos** activada primero.

1. Ve a tu cuenta de Google → **Seguridad** → https://myaccount.google.com/security
2. Activa la **Verificación en 2 pasos** (es obligatorio)
3. Una vez activada, ve a **Contraseñas de aplicaciones**: https://myaccount.google.com/apppasswords
4. Genera una nueva contraseña:
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Ingresa "Phoebe Backend"
   - Copia la contraseña de 16 caracteres generada
5. Usa esa contraseña en `GMAIL_APP_PASSWORD` o `SMTP_PASSWORD`

**Si no puedes activar la verificación en 2 pasos**, usa otra opción SMTP (ver sección 3).

### 3. Otros Servicios SMTP

Puedes usar cualquier servicio SMTP:
- **SendGrid**: `smtp.sendgrid.net` (puerto 587)
- **Mailgun**: `smtp.mailgun.org` (puerto 587)
- **AWS SES**: Configura según la región
- **Outlook/Hotmail**: `smtp-mail.outlook.com` (puerto 587)

## Endpoints

### POST `/auth/forgot-password`
Solicita un código OTP por email.

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Codice di verifica inviato"
}
```

### POST `/auth/verify-otp`
Verifica el código OTP ingresado.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Codice verificato con successo"
}
```

## Flujo Completo

1. Usuario ingresa email en la app → Llama a `/auth/forgot-password`
2. Backend genera código de 6 dígitos y lo envía por email
3. Usuario recibe email con código de 6 dígitos
4. Usuario ingresa código en la app → Llama a `/auth/verify-otp`
5. Si el código es válido, el usuario puede cambiar su contraseña

## Notas

- Los códigos expiran después de 10 minutos
- Máximo 5 intentos de verificación por código
- Los códigos se almacenan en memoria (en producción, considera usar Redis)
- El frontend debe tener `EXPO_PUBLIC_API_BASE_URL` configurado apuntando al backend


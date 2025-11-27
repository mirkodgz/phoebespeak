# Solución: Correo de Confirmación No Llega

## Problema
El correo de confirmación de registro no llega, pero el correo de recuperación de contraseña sí llega.

## Causa
- **Recuperación de contraseña**: Usa el backend personalizado (nodemailer) → ✅ Funciona
- **Confirmación de registro**: Usa el servicio built-in de Supabase → ❌ Tiene rate limits

## Soluciones

### Opción 1: Desactivar confirmación de email (Solo para desarrollo)

1. Ve a **Supabase Dashboard** → **Authentication** → **Settings** → **Email Auth**
2. **Desactiva** "Enable email confirmations"
3. Guarda los cambios
4. Prueba el registro de nuevo

⚠️ **Nota**: Esto solo es para desarrollo. En producción, deberías tener confirmación de email activada.

### Opción 2: Configurar SMTP personalizado en Supabase (Recomendado)

1. Ve a **Supabase Dashboard** → **Settings** → **Authentication** → **Email**
2. Haz clic en **"Set up SMTP"** (el botón que aparece en el aviso amarillo)
3. Configura tu SMTP:
   - **SMTP Host**: `smtp.gmail.com` (o tu servidor SMTP)
   - **SMTP Port**: `587`
   - **SMTP User**: Tu email de Gmail
   - **SMTP Password**: Tu App Password de Gmail (la misma que usas en el backend)
   - **Sender email**: Tu email
   - **Sender name**: "Phoebe" o "Active Speak"
4. Guarda los cambios
5. Prueba el registro de nuevo

### Opción 3: Verificar configuración actual

1. Ve a **Authentication** → **Settings** → **Email Auth**
2. Verifica que:
   - ✅ **Enable email confirmations** esté activado
   - ✅ **Enable email signup** esté activado
3. Ve a **Authentication** → **Email Templates** → **Confirm signup**
4. Verifica que el template esté guardado correctamente
5. Revisa **Logs** → **Auth Logs** para ver si hay errores

### Opción 4: Revisar logs de Supabase

1. Ve a **Logs** → **Auth Logs**
2. Busca eventos de `signup` o `email_confirmation`
3. Busca errores relacionados con el envío de correos
4. Si ves errores de rate limiting, espera unos minutos y vuelve a intentar

## Verificación rápida

1. **Prueba con un email diferente**: Algunos proveedores bloquean correos de Supabase
2. **Revisa la carpeta de spam**: Los correos pueden ir a spam
3. **Espera unos minutos**: Si hay rate limiting, puede tardar
4. **Verifica que el usuario se creó**: Ve a **Authentication** → **Users** y busca tu email

## Recomendación

Para desarrollo, usa la **Opción 1** (desactivar confirmación). Para producción, usa la **Opción 2** (configurar SMTP personalizado).


# Configuración de Correos en Supabase

Esta guía te ayudará a verificar que los correos de confirmación se estén enviando correctamente.

## Verificar configuración de Email en Supabase

1. **Ve a tu proyecto en Supabase**
   - Accede a [supabase.com](https://supabase.com)
   - Selecciona tu proyecto

2. **Revisa la configuración de Authentication**
   - Ve a **Authentication** → **Settings**
   - Busca la sección **Email Auth**
   - Verifica que:
     - ✅ **Enable email confirmations** esté activado
     - ✅ **Enable email signup** esté activado

3. **Verifica el template de confirmación**
   - Ve a **Authentication** → **Email Templates**
   - Selecciona **Confirm signup**
   - Verifica que el template esté configurado (debería tener el template personalizado que configuramos)

4. **Revisa los logs de Supabase**
   - Ve a **Logs** → **Auth Logs**
   - Busca eventos de `signup` o `email_confirmation`
   - Verifica si hay errores al enviar correos

## Problemas comunes

### El correo no llega

1. **Revisa la carpeta de spam**
   - Los correos de Supabase a veces van a spam
   - Busca correos de `noreply@mail.app.supabase.io` o el dominio configurado

2. **Verifica el dominio del remitente**
   - En **Settings** → **Authentication** → **Email**
   - Verifica que el dominio esté configurado correctamente
   - Si usas un dominio personalizado, verifica los registros DNS

3. **Revisa los límites de rate limiting**
   - Supabase tiene límites en el plan gratuito
   - Si enviaste muchos correos, podrías haber alcanzado el límite

### El usuario se crea pero no se guarda el perfil

- El perfil ahora se crea inmediatamente después del registro (incluso si requiere confirmación)
- Si el perfil no se crea, revisa los logs de la consola de la app
- Verifica que la tabla `profiles` tenga las políticas RLS correctas

## Verificar que el registro funciona

1. **Registra un nuevo usuario desde la app**
2. **Revisa la consola de la app** - Deberías ver:
   ```
   [signUp] Perfil creado para usuario: [user-id]
   ```
3. **Revisa Supabase Dashboard**
   - Ve a **Authentication** → **Users**
   - Deberías ver el nuevo usuario (aunque no esté confirmado)
   - Ve a **Table Editor** → **profiles**
   - Deberías ver el perfil del usuario con su `full_name`

4. **Revisa tu correo**
   - Deberías recibir el correo de confirmación
   - Si no llega, revisa spam y los logs de Supabase

## Configuración avanzada (opcional)

Si quieres usar tu propio servicio de email en lugar del de Supabase:

1. **Configura SMTP personalizado**
   - Ve a **Settings** → **Authentication** → **Email**
   - Configura tu servidor SMTP
   - Esto requiere un servidor SMTP válido (Gmail, SendGrid, etc.)

2. **Usa un dominio personalizado**
   - Configura un dominio para los correos
   - Esto mejora la deliverabilidad y evita spam



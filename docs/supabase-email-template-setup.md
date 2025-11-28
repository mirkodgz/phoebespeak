# Configuración de Template de Email de Confirmación en Supabase

Esta guía te ayudará a personalizar el correo de confirmación de registro para que tenga el mismo diseño que el correo de recuperación de contraseña.

## Pasos para configurar el template

1. **Accede a tu proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com) e inicia sesión
   - Selecciona tu proyecto

2. **Navega a Email Templates**
   - En el menú lateral izquierdo, ve a **Authentication**
   - Luego haz clic en **Email Templates**
   - Selecciona **Confirm signup** (Confirmar registro)

3. **Copia el template HTML**
   - Abre el archivo `docs/email-templates/confirm-signup-template.html`
   - Copia todo el contenido HTML

4. **Pega el template en Supabase**
   - En Supabase, en la sección **Email Body**, pega el HTML copiado
   - Reemplaza el contenido existente

5. **Configura el Subject (Asunto)**
   - En el campo **Subject**, escribe:
     ```
     Conferma la tua registrazione - Phoebe
     ```

6. **Configura el remitente (opcional)**
   - En **Settings → Authentication → Email**, puedes configurar:
     - **From email**: El correo desde el que se enviarán los emails
     - **From name**: El nombre que aparecerá como remitente (ej: "Phoebe" o "Active Speak")

7. **Guarda los cambios**
   - Haz clic en **Save** o **Update** para guardar el template

## Variables disponibles en el template

Supabase proporciona estas variables que puedes usar en el template:

- `{{ .ConfirmationURL }}` - El enlace de confirmación que el usuario debe hacer clic
- `{{ .Email }}` - El correo electrónico del usuario
- `{{ .Token }}` - El token de confirmación (generalmente no se usa directamente)
- `{{ .TokenHash }}` - Hash del token (generalmente no se usa directamente)
- `{{ .SiteURL }}` - URL de tu sitio/aplicación

## Verificación

Después de configurar el template:

1. Registra un nuevo usuario desde la app
2. Revisa el correo de confirmación que recibes
3. Deberías ver:
   - Header con "Phoebe" en color #0B3D4D
   - Botón verde para confirmar
   - Diseño consistente con el correo de recuperación de contraseña

## Notas importantes

- El template usa el mismo diseño y colores que el correo de recuperación de contraseña
- El remitente aparecerá como "Phoebe" o el nombre que configures en "From name"
- El correo se enviará desde la dirección configurada en "From email" (por defecto, Supabase usa su propio dominio)



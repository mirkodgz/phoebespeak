# Configuración de Autenticación con Google

## Pasos para configurar Google OAuth en Supabase

### 1. Configurar Google OAuth en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en **Create Credentials** → **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Tipo de aplicación: **External**
   - Información de la app: nombre, email de soporte
   - Scopes: email, profile, openid
   - Usuarios de prueba: agrega emails de prueba (opcional)
6. Crea el OAuth client ID:
   - Tipo de aplicación: **Web application**
   - Nombre: "Phoebe App"
   - **Authorized redirect URIs**: Agrega:
     ```
     https://hqjlxxidalzioudlivmq.supabase.co/auth/v1/callback
     ```
   - Guarda el **Client ID** y **Client Secret**

### 2. Configurar en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Ve a **Authentication** → **Providers**
3. Habilita el proveedor **Google**
4. Ingresa:
   - **Client ID (for OAuth)**: El Client ID que obtuviste de Google Cloud Console
   - **Client Secret (for OAuth)**: El Client Secret que obtuviste de Google Cloud Console
5. Guarda los cambios

### 3. Configurar Redirect URLs en Supabase

1. En Supabase Dashboard, ve a **Authentication** → **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   phoebe://auth/callback
   ```
   **IMPORTANTE**: 
   - Debe ser exactamente `phoebe://auth/callback` (no solo `phoebe://`)
   - Esta es la URL a la que Supabase redirigirá después de procesar el callback de Google
   - NO necesitas agregar la URL de Supabase callback aquí, solo el scheme de la app
3. Guarda los cambios

### 4. Verificar configuración en la app

La app ya está configurada para usar Google Auth. Solo necesitas:
- Tener `EXPO_PUBLIC_SUPABASE_URL` configurado en tu `.env`
- Que el backend no sea necesario para Google Auth (todo se maneja desde el frontend)

## Cómo funciona

1. Usuario hace clic en el botón de Google
2. Se abre el navegador con la autenticación de Google
3. Usuario autoriza la app
4. Google redirige a Supabase con un código (esto es automático, Supabase maneja esto internamente)
5. Supabase procesa el código y crea la sesión
6. Supabase redirige a `phoebe://auth/callback` con los tokens/código
7. La app recibe el redirect y extrae los tokens/código
8. La app intercambia el código por una sesión (si es necesario)
9. El usuario queda autenticado en la app

## Notas importantes

- **No necesitas configurar nada en el backend** para Google Auth
- Todo el flujo se maneja desde el frontend con Supabase
- El email del usuario se obtiene automáticamente de Google
- El perfil se crea automáticamente cuando el usuario se autentica por primera vez

## Troubleshooting

Si tienes errores:
1. Verifica que el Client ID y Secret sean correctos
2. Verifica que la URL de redirect en Google Cloud Console coincida exactamente con la de Supabase
3. Verifica que Google OAuth esté habilitado en Supabase
4. Revisa la consola del navegador para ver errores específicos


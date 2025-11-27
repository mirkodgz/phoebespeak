# Debug de Google Auth

## Problema actual
Safari intenta abrir "localhost" en lugar de la URL correcta de Google OAuth.

## Pasos para debuggear

1. **Verifica los logs en la consola cuando haces clic en el botón de Google:**
   - Deberías ver: `[signInWithGoogle] Supabase URL: ...`
   - Deberías ver: `[signInWithGoogle] Redirect To: ...`
   - Deberías ver: `[signInWithGoogle] OAuth URL: ...`
   
2. **Si ves "localhost" en alguno de estos logs:**
   - El problema es que `EXPO_PUBLIC_SUPABASE_URL` no se está leyendo correctamente
   - Reinicia completamente la app: `expo start -c`

3. **Si la URL de OAuth es correcta pero Safari abre localhost:**
   - El problema podría ser con `WebBrowser.openAuthSessionAsync`
   - Podríamos necesitar usar un enfoque diferente

## Solución temporal

Si el problema persiste, podemos usar el método de Supabase que maneja todo automáticamente sin `skipBrowserRedirect`.


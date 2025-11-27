# Solución de Problemas: Correo de Confirmación No Llega

## Verificación paso a paso

### 1. Verificar que el template esté guardado correctamente

1. Ve a **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Selecciona **Confirm signup**
3. Verifica que el template esté guardado (debería mostrar tu HTML personalizado)
4. Si no está guardado, pégalo de nuevo y haz clic en **Save**

### 2. Probar con template simple

Si el template personalizado no funciona, prueba con esta versión simplificada:

```html
<h2>Conferma la tua registrazione</h2>

<p>Ciao,</p>

<p>Grazie per esserti registrato su Phoebe! Per completare la registrazione, conferma il tuo indirizzo email cliccando sul link qui sotto.</p>

<p><a href="{{ .ConfirmationURL }}">Conferma la tua email</a></p>

<p>Oppure copia e incolla questo link nel tuo browser:</p>

<p>{{ .ConfirmationURL }}</p>

<p><strong>Importante:</strong> Se non hai richiesto questa registrazione, ignora questa email. Il link di conferma scadrà tra 24 ore.</p>

<p>Benvenuto in Phoebe! 🎉</p>
```

**Pasos:**
1. Copia el template simple de arriba
2. Pégalo en Supabase (reemplaza el template actual)
3. Guarda los cambios
4. Intenta registrarte de nuevo

### 3. Verificar configuración de Authentication

1. Ve a **Settings** → **Authentication** → **Email**
2. Verifica que:
   - ✅ **Enable email confirmations** esté activado
   - ✅ **Enable email signup** esté activado
   - ✅ **Secure email change** esté activado (opcional)

### 4. Revisar logs de Supabase

1. Ve a **Logs** → **Auth Logs**
2. Busca eventos relacionados con tu registro:
   - Busca `signup` events
   - Busca `email_confirmation` events
   - Busca errores relacionados con email

3. Si ves errores, cópialos y revísalos

### 5. Verificar que el usuario se creó

1. Ve a **Authentication** → **Users**
2. Busca el email que usaste para registrarte
3. Verifica que el usuario exista (aunque no esté confirmado)
4. Si el usuario no existe, el problema es en el registro, no en el correo

### 6. Verificar carpeta de spam

- Revisa la carpeta de spam de tu correo
- Los correos de Supabase a veces van a spam
- Busca correos de `noreply@mail.app.supabase.io` o el dominio configurado

### 7. Probar con correo diferente

- Intenta registrarte con un correo diferente
- Algunos proveedores de correo bloquean correos de Supabase

### 8. Verificar límites de rate limiting

- Supabase tiene límites en el plan gratuito
- Si enviaste muchos correos, podrías haber alcanzado el límite
- Espera unos minutos y vuelve a intentar

## Si nada funciona

1. **Usa el template por defecto de Supabase temporalmente:**
   - Restaura el template por defecto en Supabase
   - Intenta registrarte de nuevo
   - Si funciona, el problema es el template personalizado

2. **Verifica la sintaxis del template:**
   - Asegúrate de que todas las variables estén correctas: `{{ .ConfirmationURL }}`
   - No uses espacios extra: `{{.ConfirmationURL}}` también funciona
   - Verifica que no haya caracteres especiales que puedan causar problemas

3. **Contacta soporte de Supabase:**
   - Si nada funciona, contacta al soporte de Supabase
   - Proporciona los logs de Auth Logs
   - Menciona que el correo no se está enviando

## Nota importante

El template HTML personalizado **NO debería** afectar si el correo se envía o no. El template solo afecta cómo se ve el correo. Si el correo no llega, el problema probablemente es:

1. Configuración de Supabase (confirmación de email desactivada)
2. El correo está en spam
3. Límites de rate limiting
4. Problema con el proveedor de correo del destinatario


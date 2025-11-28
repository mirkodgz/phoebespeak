# Configuración de Voces de Tutores (ElevenLabs)

Este documento explica cómo configurar las voces de los tutores Ace y Víctor usando ElevenLabs.

## Variables de Entorno del Backend

Para que la aplicación use dinámicamente la voz correcta según el tutor seleccionado, necesitas configurar las siguientes variables de entorno en `backend/.env`:

```env
# API Key de ElevenLabs (requerida)
ELEVENLABS_API_KEY=tu_api_key_aqui

# Voice ID para Víctor (masculino) - davide
# Si solo tienes una voz configurada, usa esta como fallback
ELEVENLABS_VOICE_ID=tu_voice_id_victor

# Voice ID específico para Víctor (opcional, si quieres ser explícito)
ELEVENLABS_VOICE_ID_DAVIDE=tu_voice_id_victor

# Voice ID específico para Ace (femenino) - phoebe
# Si no está configurado, se usará ELEVENLABS_VOICE_ID como fallback
ELEVENLABS_VOICE_ID_PHOEBE=tu_voice_id_ace

# Modelo de ElevenLabs (opcional, por defecto: eleven_flash_v2_5)
ELEVENLABS_MODEL_ID=eleven_flash_v2_5

# Base URL de ElevenLabs (opcional, por defecto: https://api.elevenlabs.io/v1)
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
```

## Cómo Funciona

1. **Selección de Tutor en Onboarding**: Cuando el usuario completa el onboarding, selecciona entre Ace o Víctor en la pantalla `OnboardingStepEight`.

2. **Almacenamiento**: La selección se guarda en las preferencias del usuario (`preferences.selectedTutor`).

3. **Uso Dinámico**: Cuando la aplicación necesita generar audio del tutor:
   - El frontend envía el `tutorId` (`'davide'` o `'phoebe'`) al backend
   - El backend mapea el `tutorId` a su `voiceId` correspondiente:
     - `'davide'` → `ELEVENLABS_VOICE_ID_DAVIDE` o `ELEVENLABS_VOICE_ID` (fallback)
     - `'phoebe'` → `ELEVENLABS_VOICE_ID_PHOEBE` o `ELEVENLABS_VOICE_ID` (fallback)
   - Se genera el audio usando el `voiceId` correcto

4. **Cambio de Tutor**: El usuario puede cambiar de tutor en cualquier momento desde la pantalla de Settings, y la voz se actualizará automáticamente.

## Configuración Mínima

Si solo tienes una voz configurada (por ejemplo, solo Víctor), simplemente configura:

```env
ELEVENLABS_API_KEY=tu_api_key
ELEVENLABS_VOICE_ID=tu_voice_id_victor
```

Ambos tutores usarán esta voz hasta que configures `ELEVENLABS_VOICE_ID_PHOEBE`.

## Obtener Voice IDs de ElevenLabs

1. Inicia sesión en tu cuenta de ElevenLabs: https://elevenlabs.io
2. Ve a la sección "Voices"
3. Selecciona la voz que deseas usar
4. Copia el Voice ID (un string alfanumérico)
5. Agrega el Voice ID a las variables de entorno correspondientes

## Verificación

Para verificar que la configuración funciona:

1. Completa el onboarding y selecciona un tutor
2. Inicia una sesión de práctica o chatea con el tutor
3. Verifica que el audio generado corresponde a la voz del tutor seleccionado
4. Cambia de tutor en Settings y verifica que la voz cambia correctamente

## Notas

- Si `ELEVENLABS_VOICE_ID_PHOEBE` no está configurado, Ace usará la misma voz que Víctor (`ELEVENLABS_VOICE_ID`)
- El sistema es retrocompatible: si no se envía `tutorId`, se usa `ELEVENLABS_VOICE_ID` por defecto
- Los cambios de tutor se aplican inmediatamente sin necesidad de reiniciar la aplicación


# phoebeProyect

## Mock services (frontend)

Mientras esperamos las credenciales reales (Supabase, Azure Speech/TTS, GPT),
la app usa una capa de servicios simulados que mantiene el contrato de datos
consistente. Puedes encontrar el detalle en [`docs/mock-services.md`](docs/mock-services.md).

## Frontend overview

Un resumen del flujo de pantallas, componentes de UI centralizados y la capa de gráficos está disponible en [`docs/frontend-overview.md`](docs/frontend-overview.md).

## Supabase

- Crea un archivo `.env` en la raíz del proyecto Expo con:
  ```
  EXPO_PUBLIC_SUPABASE_URL=tu_url_supabase
  EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
  ```
- Para más detalles (incluyendo la `service_role_key` que usará el backend), revisa [`docs/supabase-setup.md`](docs/supabase-setup.md).

## Backend (Express + IA)

- El backend vive en la carpeta `backend/`. Para arrancarlo:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- Crea un archivo `backend/.env` basándote en `backend/.env.example` y copia tus claves reales:
  ```
  OPENAI_API_KEY=...
  ELEVENLABS_API_KEY=...
  ELEVENLABS_VOICE_ID=...
  SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```
- Endpoints iniciales:
  - `POST /practice/transcribe` – recibe un archivo `audio` y devuelve la transcripción de Whisper.
  - `POST /practice/feedback` – genera feedback corto usando GPT (target sentence + transcript).
  - `POST /practice/voice` – sintetiza voz con ElevenLabs y devuelve audio MPEG.
- Ajusta `EXPO_PUBLIC_API_BASE_URL` en tu `.env` de Expo para apuntar a este backend cuando lo expongas.
# Análisis Completo del Proyecto Phoebe

## 📋 Resumen Ejecutivo

**Phoebe** es una aplicación móvil educativa para aprender inglés mediante práctica conversacional con IA. El proyecto utiliza React Native (Expo) para el frontend y Node.js/Express para el backend, integrando servicios de IA como OpenAI y ElevenLabs para proporcionar una experiencia de aprendizaje interactiva.

---

## 🏗️ Arquitectura General

### Estructura del Proyecto

```
phoebe/
├── backend/              # Servidor Express + TypeScript
│   ├── src/
│   │   ├── index.ts      # Punto de entrada del servidor
│   │   ├── routes/       # Endpoints API
│   │   ├── services/     # Integraciones con OpenAI, ElevenLabs, Supabase
│   │   ├── prompts/      # Sistema de prompts para IA
│   │   └── scenarios/    # Configuraciones de escenarios
│   └── dist/             # Código compilado
│
├── src/                  # Frontend React Native
│   ├── components/       # Componentes UI reutilizables
│   ├── screens/          # Pantallas de la aplicación
│   ├── navigation/       # Configuración de navegación
│   ├── services/         # Servicios del frontend
│   ├── hooks/            # Custom hooks
│   ├── roleplay/         # Lógica de roleplay
│   └── constants/        # Constantes y tipos
│
├── assets/              # Recursos multimedia (videos, imágenes)
└── docs/                # Documentación
```

---

## 🎯 Propósito y Funcionalidad Principal

### Objetivo
Aplicación de aprendizaje de inglés que permite a usuarios italianos practicar conversaciones en inglés mediante:
- **Roleplay interactivo** con avatares animados
- **Feedback en tiempo real** sobre pronunciación y gramática
- **Múltiples escenarios** (entrevistas de trabajo, café, conversaciones casuales)
- **Niveles de dificultad** (beginner, intermediate, advanced)
- **Modos de práctica** (guided/guided con rounds, free)

---

## 🔧 Stack Tecnológico

### Frontend
- **Framework**: React Native 0.81.5 con Expo ~54.0.22
- **Navegación**: React Navigation 7.x (Stack, Drawer, Bottom Tabs)
- **Estilos**: NativeWind 4.2.1 (Tailwind CSS para React Native)
- **Audio**: expo-av, expo-audio
- **Estado**: Context API + Custom Hooks
- **Internacionalización**: i18n-js
- **Base de datos**: Supabase (@supabase/supabase-js)
- **Avatares**: @heygen/streaming-avatar, LiveKit Client

### Backend
- **Runtime**: Node.js con Express 5.1.0
- **Lenguaje**: TypeScript 5.9.3
- **IA/ML**:
  - OpenAI (GPT-4o-mini, Whisper-1)
  - ElevenLabs (Text-to-Speech)
- **Base de datos**: Supabase
- **Archivos**: Multer para manejo de uploads

---

## 📱 Estructura del Frontend

### Navegación

La aplicación utiliza un sistema de navegación jerárquico:

```
RootStack
├── OnboardingStack (si !hasOnboarded)
│   ├── Onboarding (8 pasos)
│   └── ...
├── AuthStack (si !isAuthenticated)
│   ├── Login
│   ├── Register
│   └── PremiumUpsell
└── Main (si isAuthenticated && hasOnboarded)
    └── Menu (Drawer)
        └── Screens (Stack)
            ├── Home
            ├── Dashboard
            ├── RolePlay
            ├── RolePlayModeSelection
            ├── PracticeSession ⭐ (Pantalla principal)
            ├── ProgressOverview
            ├── Profile
            └── SettingsScreen
```

### Pantallas Principales

1. **Onboarding** (8 pasos)
   - Recolección de información inicial del usuario
   - Preferencias de aprendizaje

2. **Login/Register**
   - Autenticación con Supabase
   - Upsell de premium

3. **Home**
   - Pantalla principal después del login

4. **Dashboard**
   - Resumen de progreso y estadísticas

5. **RolePlay**
   - Selección de escenarios y niveles

6. **PracticeSession** ⭐
   - **Pantalla central de la aplicación**
   - Maneja:
     - Grabación de audio del usuario
     - Transcripción con Whisper
     - Generación de feedback con GPT
     - Síntesis de voz con ElevenLabs
     - Conversación dinámica con IA
     - Modos: Guided (con rounds) y Free
     - Avatares animados (Davide/Phoebe)

7. **ProgressOverview**
   - Visualización de progreso con gráficos

8. **Profile & Settings**
   - Configuración de usuario y preferencias

### Componentes Clave

#### UI Components (`src/components/`)
- `BrandBackground`: Fondo con degradados y efectos visuales
- `BrandActionButton`: Botones con estilo de marca
- `BrandSurface`: Superficies elevadas
- `BrandProgressBar`: Barras de progreso
- `BrandLineChart`: Gráficos de línea/área
- `RolePlayAvatar`: Avatar animado con video (modos: speaking, listening, idle)
- `RoundCompleteModal`: Modal de finalización de round
- `Text`, `Button`, `Input`, `Modal`, etc.: Componentes base

#### Hooks Personalizados (`src/hooks/`)
- `useData`: Estado global de la aplicación
- `useTheme`: Sistema de temas (light/dark)
- `useTranslation`: Internacionalización
- `usePracticeAudio`: Manejo de grabación de audio
- `useScreenOptions`: Configuración de pantallas

### Servicios del Frontend (`src/services/`)

1. **practice.ts**
   - `transcribePracticeAudio()`: Envía audio al backend para transcripción
   - `requestPracticeFeedback()`: Solicita feedback de pronunciación
   - `requestPracticeVoice()`: Genera audio con ElevenLabs
   - `requestNextConversationTurn()`: Genera siguiente turno de conversación
   - `requestTranslate()`: Traduce texto
   - `requestFreeInterviewTurn()`: Modo libre de entrevista

2. **supabaseAuth.ts**: Autenticación con Supabase
3. **dashboard.ts**, **progress.ts**, **preferences.ts**: Servicios de datos

---

## 🖥️ Estructura del Backend

### Servidor Express (`backend/src/index.ts`)

- **Puerto**: 4000 (configurable vía `PORT`)
- **Middleware**:
  - CORS habilitado
  - JSON parsing
  - Logging de requests
  - Error handling global

### Endpoints API (`backend/src/routes/practice.ts`)

#### 1. `POST /practice/transcribe`
- **Propósito**: Transcribir audio a texto
- **Input**: Archivo de audio (multipart/form-data)
- **Output**: Transcripción con segmentos y confianza
- **Tecnología**: OpenAI Whisper-1

#### 2. `POST /practice/feedback`
- **Propósito**: Generar feedback sobre pronunciación/gramática
- **Input**:
  ```json
  {
    "transcript": "string",
    "targetSentence": "string?",
    "learnerProfile": {...},
    "transcriptionSegments": [...],
    "conversationContext": {...}
  }
  ```
- **Output**:
  ```json
  {
    "summary": "string",
    "score": 0-100,
    "verdict": "correct" | "needs_improvement"
  }
  ```
- **Tecnología**: GPT-4o-mini con prompts especializados

#### 3. `POST /practice/generate-next-turn`
- **Propósito**: Generar siguiente turno de conversación (modo guided)
- **Input**:
  ```json
  {
    "scenarioId": "jobInterview",
    "levelId": "beginner",
    "conversationHistory": [...],
    "studentName": "string",
    "turnNumber": 1,
    "predefinedQuestions": ["string?"]
  }
  ```
- **Output**:
  ```json
  {
    "feedback": "string",
    "question": "string",
    "tutorMessage": "string",
    "shouldEnd": boolean,
    "closingMessage": "string?"
  }
  ```

#### 4. `POST /practice/generate-free-interview-turn`
- **Propósito**: Generar turno en modo libre (sin preguntas predefinidas)
- Similar a `generate-next-turn` pero sin `predefinedQuestions`

#### 5. `POST /practice/voice`
- **Propósito**: Sintetizar texto a voz
- **Input**: `{ "text": "string" }`
- **Output**: Audio MPEG (binary)
- **Tecnología**: ElevenLabs API

#### 6. `POST /practice/translate`
- **Propósito**: Traducir texto (inglés → italiano)
- **Input**: `{ "text": "string", "targetLanguage": "italian" }`
- **Output**: `{ "translation": "string" }`

### Servicios del Backend (`backend/src/services/`)

#### 1. **openai.ts**
- `transcribeAudio()`: Transcripción con Whisper
- `generatePracticeFeedback()`: Feedback con GPT
- `generateNextConversationTurn()`: Generación de conversación
- `translateText()`: Traducción

#### 2. **elevenlabs.ts**
- `synthesizeSpeech()`: Text-to-Speech con ElevenLabs
- Manejo de errores (401, 402, 429)

#### 3. **supabase.ts**
- Cliente de Supabase para base de datos

#### 4. **openailiberainterview.ts**
- Servicio específico para entrevistas libres

### Sistema de Prompts (`backend/src/prompts/`)

Sistema modular y extensible para gestionar prompts de IA:

```
prompts/
├── base/
│   ├── composer.ts          # Constructor de prompts
│   ├── feedback-structures.ts
│   └── instructions.ts      # Instrucciones base
├── scenarios/
│   └── jobInterview/
│       ├── beginner/
│       │   ├── guided/
│       │   │   ├── main.ts
│       │   │   └── rounds/
│       │   │       └── base.ts
│       │   └── free.ts
│       ├── intermediate/
│       │   ├── guided.ts
│       │   └── free.ts
│       └── advanced/
│           ├── guided.ts
│           └── free.ts
└── index.ts                 # Factory principal
```

**Características**:
- Prompts específicos por escenario, nivel y modo
- Soporte para rounds (preguntas predefinidas)
- Contexto dinámico (historial, nombre del estudiante, etc.)
- Formato de respuesta configurable (JSON/text)

### Escenarios (`backend/src/scenarios/`)

Configuraciones de escenarios de roleplay:

- **jobInterview**: Entrevista de trabajo (con rounds)
- **atTheCafe**: En el café
- **dailySmallTalk**: Conversación casual
- **meetingSomeoneNew**: Conocer a alguien nuevo

Cada escenario tiene:
- Configuración por nivel (beginner/intermediate/advanced)
- Modos: static (conversación predefinida), dynamic (IA), hybrid
- Rounds (solo jobInterview beginner actualmente)

---

## 🎮 Flujo de Práctica (PracticeSession)

### Modo Guided (con Rounds)

1. **Inicialización**
   - Carga del escenario y nivel
   - Selección de avatar (Davide/Phoebe)
   - Carga de rounds y preguntas

2. **Round Structure**
   - Cada round tiene múltiples preguntas (A, B, C, D, E)
   - El usuario responde a cada pregunta
   - Feedback después de cada respuesta

3. **Flujo de Turno**
   ```
   Tutor pregunta → Usuario graba → Transcripción → Feedback → Siguiente pregunta
   ```

4. **Finalización de Round**
   - Modal de completado
   - Opción de continuar al siguiente round

### Modo Free

1. **Conversación Dinámica**
   - IA genera preguntas basadas en contexto
   - Sin estructura predefinida
   - Finalización automática cuando la IA decide

2. **Flujo Similar**
   - Grabación → Transcripción → Feedback → Siguiente turno

### Estados del Avatar

- **speaking**: Reproduce video de avatar hablando
- **listening**: Frame estático con anillo pulsante verde
- **idle**: Frame estático con boca cerrada

---

## 🔐 Configuración y Variables de Entorno

### Frontend (`.env` en raíz)
```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Backend (`backend/.env`)
```env
PORT=4000
OPENAI_API_KEY=...
OPENAI_FEEDBACK_MODEL=gpt-4o-mini
OPENAI_TRANSCRIBE_MODEL=whisper-1
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📊 Tipos y Estructuras de Datos

### Frontend (`src/roleplay/types.ts`)
- `RolePlayScenarioId`: 'jobInterview' | 'atTheCafe' | 'dailySmallTalk' | 'meetingSomeoneNew'
- `RolePlayLevelId`: 'beginner' | 'intermediate' | 'advanced'
- `ConversationFlowMode`: 'static' | 'dynamic' | 'hybrid'
- `Round`, `RoundQuestion`, `ConversationFlowConfig`

### Backend (`backend/src/prompts/types.ts`)
- `RolePlayMode`: 'guided' | 'free'
- `PromptContext`: Contexto para generación de prompts
- `PromptConfig`: Configuración de prompt (systemPrompt, userPrompt, responseFormat)
- `RoundConfig`, `ScenarioConfig`

---

## 🎨 Sistema de Temas

- **Tema claro/oscuro** configurable
- **Componentes de marca** con estilos consistentes
- **Gradientes y efectos visuales** (BrandBackground)
- **Fuentes personalizadas** (OpenSans)

---

## 🔄 Flujo de Datos

### Ejemplo: Práctica de Pronunciación

```
Usuario graba audio
    ↓
Frontend: usePracticeAudio → guarda URI
    ↓
Frontend: transcribePracticeAudio() → POST /practice/transcribe
    ↓
Backend: transcribeAudio() → OpenAI Whisper
    ↓
Backend: retorna transcripción con segmentos
    ↓
Frontend: requestPracticeFeedback() → POST /practice/feedback
    ↓
Backend: generatePracticeFeedback() → GPT-4o-mini
    ↓
Backend: retorna feedback (summary, score, verdict)
    ↓
Frontend: muestra feedback al usuario
    ↓
Frontend: requestPracticeVoice() → POST /practice/voice (para siguiente pregunta)
    ↓
Backend: synthesizeSpeech() → ElevenLabs
    ↓
Backend: retorna audio MPEG
    ↓
Frontend: reproduce audio del tutor
```

---

## 🚀 Puntos Fuertes del Proyecto

1. **Arquitectura Modular**
   - Separación clara frontend/backend
   - Sistema de prompts extensible
   - Componentes reutilizables

2. **Experiencia de Usuario**
   - Avatares animados
   - Feedback en tiempo real
   - Múltiples modos de práctica

3. **Escalabilidad**
   - Sistema de prompts permite agregar nuevos escenarios fácilmente
   - Estructura preparada para múltiples idiomas

4. **TypeScript**
   - Tipado fuerte en todo el proyecto
   - Mejor mantenibilidad

---

## ⚠️ Áreas de Mejora Identificadas

1. **Documentación**
   - Algunos archivos tienen comentarios limitados
   - Falta documentación de API detallada

2. **Manejo de Errores**
   - Algunos servicios podrían tener mejor manejo de errores
   - Mensajes de error más descriptivos

3. **Testing**
   - No se observan tests unitarios o de integración

4. **Optimización**
   - Posible optimización de carga de videos de avatar
   - Caché de respuestas de IA

---

## 📝 Notas Técnicas

### TypeScript Configuration
- **Frontend**: Extiende `expo/tsconfig.base`, strict mode
- **Backend**: Configuración más estricta (noUncheckedIndexedAccess, exactOptionalPropertyTypes)

### Dependencias Clave
- **React 19.1.0**: Versión muy reciente
- **Expo ~54.0.22**: Versión estable
- **Express 5.1.0**: Versión más reciente de Express
- **OpenAI 6.8.1**: SDK actualizado

### Archivos No Rastreados (Git Status)
- `backend/src/prompts/` (nuevo sistema de prompts)
- `backend/src/scenarios/` (configuraciones de escenarios)
- `backend/src/services/openailiberainterview.ts`
- `src/components/RoundCompleteModal.tsx`

---

## 🎯 Conclusión

Phoebe es un proyecto bien estructurado que combina tecnologías modernas (React Native, TypeScript, IA) para crear una experiencia de aprendizaje de idiomas innovadora. La arquitectura modular y el sistema de prompts permiten fácil extensión a nuevos escenarios y funcionalidades.

El proyecto está en desarrollo activo, con nuevas características como el sistema de prompts y rounds siendo implementadas. La separación entre frontend y backend, junto con el uso de TypeScript, facilita el mantenimiento y la escalabilidad.


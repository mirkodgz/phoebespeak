# Arquitectura de Almacenamiento de Progreso - Role Plays

## 📊 Análisis del Sistema Actual

### Escenarios Identificados
1. **jobInterview** - Entrevista de trabajo
2. **atTheCafe** - En el café
3. **dailySmallTalk** - Conversación casual
4. **meetingSomeoneNew** - Conocer a alguien nuevo

### Niveles por Escenario
- **beginner** - Principiante
- **intermediate** - Intermedio
- **advanced** - Avanzado

### Modos de Práctica
- **guided** - Modo guiado (con o sin rounds)
- **free** - Modo libre (conversación dinámica)

### Estructura de Rounds
- Algunos escenarios tienen **rounds** (ej: jobInterview beginner tiene 3 rounds)
- Cada round tiene múltiples preguntas (A, B, C, D, E)
- No todos los escenarios/niveles tienen rounds

### Estado Actual de la Base de Datos
- ✅ Tabla `profiles` existe (con `has_onboarded`)
- ⚠️ Tabla `practice_sessions` existe pero es **muy básica**:
  - Solo guarda: `target_sentence`, `feedback`, `score`, `audio_url`
  - **NO trackea**: escenario, nivel, modo, completitud, rounds, etc.
  - **NO es escalable** para el sistema actual

---

## 🏗️ Arquitectura Propuesta (Escalable)

### Tablas Necesarias

#### 1. `role_play_sessions` (Sesiones Completas)
Almacena cada sesión de role play completada.

```sql
CREATE TABLE IF NOT EXISTS public.role_play_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificación de la sesión
  scenario_id TEXT NOT NULL CHECK (scenario_id IN ('jobInterview', 'atTheCafe', 'dailySmallTalk', 'meetingSomeoneNew')),
  level_id TEXT NOT NULL CHECK (level_id IN ('beginner', 'intermediate', 'advanced')),
  mode TEXT NOT NULL CHECK (mode IN ('guided', 'free')),
  
  -- Estado de la sesión
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Métricas de la sesión
  total_turns INTEGER DEFAULT 0, -- Total de turnos completados
  total_questions INTEGER DEFAULT 0, -- Total de preguntas respondidas
  total_rounds INTEGER DEFAULT 0, -- Total de rounds completados (si aplica)
  duration_seconds INTEGER, -- Duración total de la sesión en segundos
  
  -- Estadísticas de rendimiento
  average_score NUMERIC(5, 2), -- Puntuación promedio (0-100)
  total_feedback_count INTEGER DEFAULT 0,
  
  -- Metadatos
  tutor_id TEXT CHECK (tutor_id IN ('davide', 'phoebe')), -- Tutor seleccionado
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_role_play_sessions_user_id ON public.role_play_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_role_play_sessions_scenario_level ON public.role_play_sessions(scenario_id, level_id);
CREATE INDEX IF NOT EXISTS idx_role_play_sessions_status ON public.role_play_sessions(status);
CREATE INDEX IF NOT EXISTS idx_role_play_sessions_completed_at ON public.role_play_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_role_play_sessions_user_scenario ON public.role_play_sessions(user_id, scenario_id, level_id);
```

#### 2. `role_play_rounds` (Rounds Completados)
Almacena cada round completado dentro de una sesión (solo para modo guided con rounds).

```sql
CREATE TABLE IF NOT EXISTS public.role_play_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.role_play_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificación del round
  round_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  round_title TEXT, -- "General Questions", "Behavioral & Problem-Solving", etc.
  
  -- Estado del round
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Métricas del round
  total_questions INTEGER NOT NULL, -- Total de preguntas en el round
  questions_answered INTEGER DEFAULT 0, -- Preguntas respondidas
  average_score NUMERIC(5, 2), -- Puntuación promedio del round
  
  -- Metadatos
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: un usuario no puede tener el mismo round_number en la misma sesión
  UNIQUE(session_id, round_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_role_play_rounds_session_id ON public.role_play_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_role_play_rounds_user_id ON public.role_play_rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_role_play_rounds_status ON public.role_play_rounds(status);
```

#### 3. `role_play_turns` (Turnos Individuales)
Almacena cada turno (pregunta-respuesta-feedback) dentro de una sesión.

```sql
CREATE TABLE IF NOT EXISTS public.role_play_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.role_play_sessions(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.role_play_rounds(id) ON DELETE SET NULL, -- NULL si no hay rounds
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificación del turno
  turn_number INTEGER NOT NULL, -- 1, 2, 3, etc. (secuencial en la sesión)
  question_letter TEXT, -- 'A', 'B', 'C', 'D', 'E' (solo para rounds)
  
  -- Contenido del turno
  question_text TEXT NOT NULL, -- Pregunta del tutor
  user_response_text TEXT, -- Transcripción de la respuesta del usuario
  feedback_text TEXT, -- Feedback del tutor
  verdict TEXT CHECK (verdict IN ('correct', 'needs_improvement', null)), -- Veredicto del feedback
  
  -- Puntuación
  score NUMERIC(5, 2), -- Puntuación del turno (0-100)
  
  -- Audio (opcional, para análisis futuro)
  audio_url TEXT, -- URL del audio de la respuesta
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: un usuario no puede tener el mismo turn_number en la misma sesión
  UNIQUE(session_id, turn_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_role_play_turns_session_id ON public.role_play_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_role_play_turns_round_id ON public.role_play_turns(round_id);
CREATE INDEX IF NOT EXISTS idx_role_play_turns_user_id ON public.role_play_turns(user_id);
CREATE INDEX IF NOT EXISTS idx_role_play_turns_created_at ON public.role_play_turns(created_at);
```

#### 4. `user_progress_summary` (Vista Materializada o Tabla)
Resumen agregado del progreso del usuario (para consultas rápidas).

```sql
CREATE TABLE IF NOT EXISTS public.user_progress_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Estadísticas generales
  total_sessions_completed INTEGER DEFAULT 0,
  total_practice_time_seconds INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_rounds_completed INTEGER DEFAULT 0,
  
  -- Estadísticas por escenario
  job_interview_sessions INTEGER DEFAULT 0,
  at_the_cafe_sessions INTEGER DEFAULT 0,
  daily_small_talk_sessions INTEGER DEFAULT 0,
  meeting_someone_new_sessions INTEGER DEFAULT 0,
  
  -- Estadísticas por nivel
  beginner_sessions INTEGER DEFAULT 0,
  intermediate_sessions INTEGER DEFAULT 0,
  advanced_sessions INTEGER DEFAULT 0,
  
  -- Estadísticas por modo
  guided_sessions INTEGER DEFAULT 0,
  free_sessions INTEGER DEFAULT 0,
  
  -- Puntuación promedio
  average_score NUMERIC(5, 2),
  
  -- Fechas
  first_session_at TIMESTAMP WITH TIME ZONE,
  last_session_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_user_progress_summary_updated_at ON public.user_progress_summary(updated_at);
```

---

## 🔐 Row Level Security (RLS)

### Políticas de Seguridad

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.role_play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_play_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_play_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress_summary ENABLE ROW LEVEL SECURITY;

-- role_play_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.role_play_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.role_play_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.role_play_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- role_play_rounds
CREATE POLICY "Users can view their own rounds"
  ON public.role_play_rounds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rounds"
  ON public.role_play_rounds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rounds"
  ON public.role_play_rounds FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- role_play_turns
CREATE POLICY "Users can view their own turns"
  ON public.role_play_turns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own turns"
  ON public.role_play_turns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_progress_summary
CREATE POLICY "Users can view their own progress summary"
  ON public.user_progress_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress summary"
  ON public.user_progress_summary FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔄 Triggers para Mantener Consistencia

### Trigger para actualizar `updated_at`

```sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas
CREATE TRIGGER update_role_play_sessions_updated_at
  BEFORE UPDATE ON public.role_play_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_play_rounds_updated_at
  BEFORE UPDATE ON public.role_play_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_summary_updated_at
  BEFORE UPDATE ON public.user_progress_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Trigger para actualizar `user_progress_summary` automáticamente

```sql
-- Función para actualizar el resumen de progreso
CREATE OR REPLACE FUNCTION update_user_progress_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_progress_summary (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO UPDATE SET
    total_sessions_completed = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND status = 'completed'
    ),
    total_practice_time_seconds = (
      SELECT COALESCE(SUM(duration_seconds), 0) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND status = 'completed'
    ),
    total_questions_answered = (
      SELECT COUNT(*) FROM public.role_play_turns
      WHERE user_id = NEW.user_id
    ),
    total_rounds_completed = (
      SELECT COUNT(*) FROM public.role_play_rounds
      WHERE user_id = NEW.user_id AND status = 'completed'
    ),
    job_interview_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND scenario_id = 'jobInterview' AND status = 'completed'
    ),
    at_the_cafe_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND scenario_id = 'atTheCafe' AND status = 'completed'
    ),
    daily_small_talk_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND scenario_id = 'dailySmallTalk' AND status = 'completed'
    ),
    meeting_someone_new_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND scenario_id = 'meetingSomeoneNew' AND status = 'completed'
    ),
    beginner_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND level_id = 'beginner' AND status = 'completed'
    ),
    intermediate_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND level_id = 'intermediate' AND status = 'completed'
    ),
    advanced_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND level_id = 'advanced' AND status = 'completed'
    ),
    guided_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND mode = 'guided' AND status = 'completed'
    ),
    free_sessions = (
      SELECT COUNT(*) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND mode = 'free' AND status = 'completed'
    ),
    average_score = (
      SELECT COALESCE(AVG(average_score), 0) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND status = 'completed' AND average_score IS NOT NULL
    ),
    first_session_at = (
      SELECT MIN(started_at) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id
    ),
    last_session_at = (
      SELECT MAX(completed_at) FROM public.role_play_sessions
      WHERE user_id = NEW.user_id AND status = 'completed'
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger cuando se completa una sesión
CREATE TRIGGER update_progress_on_session_complete
  AFTER UPDATE OF status ON public.role_play_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_user_progress_summary();
```

---

## 📋 Script SQL Completo

Ver archivo: `docs/supabase-progress-tables.sql`

---

## 🎯 Flujo de Datos

### 1. Inicio de Sesión
```typescript
// Crear sesión cuando el usuario inicia un role play
INSERT INTO role_play_sessions (
  user_id, scenario_id, level_id, mode, status, tutor_id, started_at
) VALUES (
  userId, 'jobInterview', 'beginner', 'guided', 'in_progress', 'davide', NOW()
);
```

### 2. Durante la Sesión (Turnos)
```typescript
// Guardar cada turno
INSERT INTO role_play_turns (
  session_id, round_id, user_id, turn_number, question_text, 
  user_response_text, feedback_text, verdict, score
) VALUES (
  sessionId, roundId, userId, 1, 'Tell me about yourself...',
  'I am a...', 'Good!', 'correct', 85.5
);
```

### 3. Completar Round (si aplica)
```typescript
// Marcar round como completado
UPDATE role_play_rounds 
SET status = 'completed', completed_at = NOW(), questions_answered = 5
WHERE id = roundId;
```

### 4. Completar Sesión
```typescript
// Marcar sesión como completada
UPDATE role_play_sessions 
SET 
  status = 'completed',
  completed_at = NOW(),
  total_turns = 8,
  total_questions = 8,
  total_rounds = 3,
  duration_seconds = 1200,
  average_score = 82.5
WHERE id = sessionId;
```

---

## 🔍 Consultas Útiles

### Obtener progreso del usuario
```sql
SELECT * FROM user_progress_summary WHERE user_id = '...';
```

### Obtener sesiones completadas por escenario
```sql
SELECT scenario_id, COUNT(*) as total
FROM role_play_sessions
WHERE user_id = '...' AND status = 'completed'
GROUP BY scenario_id;
```

### Obtener historial de sesiones
```sql
SELECT * FROM role_play_sessions
WHERE user_id = '...' AND status = 'completed'
ORDER BY completed_at DESC
LIMIT 10;
```

### Obtener estadísticas de un escenario específico
```sql
SELECT 
  COUNT(*) as total_sessions,
  AVG(average_score) as avg_score,
  SUM(duration_seconds) as total_time
FROM role_play_sessions
WHERE user_id = '...' 
  AND scenario_id = 'jobInterview'
  AND status = 'completed';
```

---

## ✅ Checklist de Implementación

### Fase 1: Base de Datos
- [ ] Ejecutar script SQL completo en Supabase
- [ ] Verificar que todas las tablas se crearon correctamente
- [ ] Verificar que RLS está habilitado
- [ ] Verificar que los triggers funcionan

### Fase 2: Servicios Backend/Frontend
- [ ] Crear servicio `progressService.ts` para interactuar con las tablas
- [ ] Implementar funciones:
  - `createSession()`
  - `addTurn()`
  - `completeRound()`
  - `completeSession()`
  - `getUserProgress()`
  - `getSessionHistory()`

### Fase 3: Integración
- [ ] Integrar en `PracticeSession.tsx`:
  - Crear sesión al iniciar
  - Guardar turnos durante la sesión
  - Completar rounds cuando corresponda
  - Completar sesión al finalizar
- [ ] Actualizar `Profile.tsx` para mostrar datos reales
- [ ] Actualizar `Home.tsx` para mostrar estadísticas reales

### Fase 4: Testing
- [ ] Probar creación de sesión
- [ ] Probar guardado de turnos
- [ ] Probar completar rounds
- [ ] Probar completar sesión
- [ ] Verificar que `user_progress_summary` se actualiza correctamente

---

## 🚀 Ventajas de esta Arquitectura

1. **Escalable**: Fácil agregar nuevos escenarios, niveles o modos
2. **Flexible**: Soporta sesiones con y sin rounds
3. **Performante**: Índices optimizados para consultas rápidas
4. **Segura**: RLS implementado correctamente
5. **Mantenible**: Triggers automáticos para consistencia
6. **Analítica**: Datos estructurados para analytics futuros
7. **Extensible**: Fácil agregar nuevas métricas o campos

---

## 📝 Notas Importantes

1. **Migración**: La tabla `practice_sessions` antigua puede mantenerse para datos históricos, pero no se usará para nuevas sesiones.

2. **Duración**: Calcular `duration_seconds` en el frontend (diferencia entre `started_at` y `completed_at`).

3. **Puntuación**: El `average_score` se calcula como promedio de los `score` de los turnos.

4. **Rounds**: Solo se crean registros en `role_play_rounds` si el escenario/nivel tiene rounds configurados.

5. **Modo Free**: En modo free, `round_id` será `NULL` en `role_play_turns`.

---

## 🔮 Futuras Mejoras

- Agregar tabla `achievements` para logros/insignias
- Agregar tabla `streaks` para rachas de práctica
- Agregar tabla `leaderboard` para rankings
- Agregar analytics más detallados (tiempo por pregunta, etc.)


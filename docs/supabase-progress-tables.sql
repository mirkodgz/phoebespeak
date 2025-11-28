-- ============================================================================
-- SCRIPT DE CREACIÓN DE TABLAS PARA ALMACENAMIENTO DE PROGRESO DE ROLE PLAYS
-- ============================================================================
-- Ejecuta este script completo en el SQL Editor de Supabase
-- Asegúrate de tener permisos de administrador
-- ============================================================================

-- ============================================================================
-- 1. TABLA: role_play_sessions (Sesiones Completas)
-- ============================================================================
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

-- ============================================================================
-- 2. TABLA: role_play_rounds (Rounds Completados)
-- ============================================================================
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

-- ============================================================================
-- 3. TABLA: role_play_turns (Turnos Individuales)
-- ============================================================================
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

-- ============================================================================
-- 4. TABLA: user_progress_summary (Resumen de Progreso)
-- ============================================================================
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

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.role_play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_play_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_play_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress_summary ENABLE ROW LEVEL SECURITY;

-- Políticas para role_play_sessions
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

-- Política para DELETE (opcional, solo si quieres permitir eliminar sesiones)
-- Por defecto NO permitimos DELETE para mantener historial completo
-- Si necesitas permitirlo, descomenta la siguiente línea:
-- CREATE POLICY "Users can delete their own sessions"
--   ON public.role_play_sessions FOR DELETE
--   USING (auth.uid() = user_id);

-- Políticas para role_play_rounds
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

-- NOTA: No permitimos DELETE de rounds para mantener integridad histórica

-- Políticas para role_play_turns
CREATE POLICY "Users can view their own turns"
  ON public.role_play_turns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own turns"
  ON public.role_play_turns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NOTA: No permitimos DELETE ni UPDATE de turns para mantener integridad histórica
-- Si necesitas eliminar datos, hazlo a nivel de sesión

-- Políticas para user_progress_summary
CREATE POLICY "Users can view their own progress summary"
  ON public.user_progress_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress summary"
  ON public.user_progress_summary FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a role_play_sessions
CREATE TRIGGER update_role_play_sessions_updated_at
  BEFORE UPDATE ON public.role_play_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a role_play_rounds
CREATE TRIGGER update_role_play_rounds_updated_at
  BEFORE UPDATE ON public.role_play_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a user_progress_summary
CREATE TRIGGER update_user_progress_summary_updated_at
  BEFORE UPDATE ON public.user_progress_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar el resumen de progreso automáticamente
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

-- Trigger para actualizar el resumen cuando se completa una sesión
CREATE TRIGGER update_progress_on_session_complete
  AFTER UPDATE OF status ON public.role_play_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_user_progress_summary();

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE 'Verificando creación de tablas...';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_play_sessions') THEN
    RAISE NOTICE '✓ Tabla role_play_sessions creada';
  ELSE
    RAISE EXCEPTION '✗ Error: Tabla role_play_sessions NO fue creada';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_play_rounds') THEN
    RAISE NOTICE '✓ Tabla role_play_rounds creada';
  ELSE
    RAISE EXCEPTION '✗ Error: Tabla role_play_rounds NO fue creada';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_play_turns') THEN
    RAISE NOTICE '✓ Tabla role_play_turns creada';
  ELSE
    RAISE EXCEPTION '✗ Error: Tabla role_play_turns NO fue creada';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress_summary') THEN
    RAISE NOTICE '✓ Tabla user_progress_summary creada';
  ELSE
    RAISE EXCEPTION '✗ Error: Tabla user_progress_summary NO fue creada';
  END IF;
  
  RAISE NOTICE '✓ Todas las tablas fueron creadas correctamente';
END $$;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Después de ejecutar este script:
-- 1. Verifica que todas las tablas aparecen en el Table Editor de Supabase
-- 2. Verifica que RLS está habilitado (deberías ver un candado en cada tabla)
-- 3. Prueba insertar un registro de prueba (si tienes un usuario de prueba)
-- ============================================================================


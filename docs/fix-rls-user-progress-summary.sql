-- ============================================================================
-- FIX: Política RLS para INSERT en user_progress_summary
-- ============================================================================
-- El trigger update_user_progress_summary() necesita poder hacer INSERT
-- cuando no existe un registro para el usuario. 
-- 
-- SOLUCIÓN: Modificar la función del trigger para usar SECURITY DEFINER
-- Esto permite que la función se ejecute con permisos de superusuario,
-- evitando problemas de RLS.
-- ============================================================================

-- Paso 1: Recrear la función con SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_user_progress_summary()
RETURNS TRIGGER 
SECURITY DEFINER -- Ejecutar con permisos de superusuario
SET search_path = public
AS $$
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

-- ============================================================================
-- NOTA IMPORTANTE:
-- ============================================================================
-- SECURITY DEFINER permite que la función se ejecute con permisos de
-- superusuario, evitando problemas de RLS. Esto es seguro porque:
-- 1. La función solo actualiza datos del usuario que completó la sesión/round
-- 2. Usa NEW.user_id para garantizar que solo se actualiza el resumen correcto
-- 3. No permite acceso directo a datos de otros usuarios
-- ============================================================================


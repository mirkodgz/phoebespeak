-- ============================================================================
-- TRIGGER ADICIONAL: Actualizar user_progress_summary cuando se completa un round
-- ============================================================================
-- Este trigger actualiza el resumen cuando se completa un round,
-- incluso si la sesión aún está en progreso.
-- Ejecuta este script si quieres que user_progress_summary se actualice
-- cada vez que se completa un round, no solo cuando se completa una sesión.
-- ============================================================================

-- Trigger para actualizar el resumen cuando se completa un round
CREATE OR REPLACE TRIGGER update_progress_on_round_complete
  AFTER UPDATE OF status ON public.role_play_rounds
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_user_progress_summary();

-- Nota: Este trigger usa la misma función update_user_progress_summary()
-- que se ejecuta cuando se completa una sesión. La función recalcula
-- todos los valores del resumen basándose en los datos actuales de las tablas.


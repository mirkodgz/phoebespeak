import {
  PROGRESS_OVERVIEW_DATA,
  WEEKLY_SCORES,
  FOCUS_AREAS,
  MILESTONES,
} from '../constants/mocks';
import {
  IProgressOverviewData,
  IWeeklyScore,
  IFocusArea,
  IMilestone,
} from '../constants/types';
import {
  getUserProgressSummary,
  getSessionHistory,
  getScenarioStats,
} from './progressService';

/**
 * Obtiene el resumen de progreso del usuario desde Supabase
 * Si no hay datos o hay error, retorna datos mock como fallback
 */
export const fetchProgressOverview =
  async (): Promise<IProgressOverviewData> => {
    try {
      const summary = await getUserProgressSummary();
      
      if (!summary) {
        // Si no hay resumen, retornar datos mock
        return PROGRESS_OVERVIEW_DATA;
      }

      // Convertir datos de Supabase al formato esperado
      const progressData: IProgressOverviewData = {
        weeklyScores: WEEKLY_SCORES, // Mantener mock por ahora (requiere cálculo semanal)
        focusAreas: FOCUS_AREAS.map(area => {
          // Actualizar con datos reales si están disponibles
          // Por ahora mantenemos los mock, pero podemos calcular desde las sesiones
          return area;
        }),
        milestones: [
          {
            id: 'streak',
            title: 'Racha',
            value: summary.total_sessions_completed > 0 ? `${summary.total_sessions_completed} días` : '0 días',
            description: 'Días consecutivos de práctica',
          },
          {
            id: 'sessions',
            title: 'Sesiones completadas',
            value: `${summary.total_sessions_completed}`,
            description: 'Total de role plays completados',
          },
          {
            id: 'time',
            title: 'Tiempo de práctica',
            value: summary.total_practice_time_seconds > 0
              ? `${Math.floor(summary.total_practice_time_seconds / 60)} min`
              : '0 min',
            description: 'Tiempo total de práctica',
          },
          {
            id: 'questions',
            title: 'Preguntas respondidas',
            value: `${summary.total_questions_answered}`,
            description: 'Total de preguntas respondidas',
          },
        ],
      };

      return progressData;
    } catch (error) {
      console.error('[fetchProgressOverview] Error al cargar progreso:', error);
      // Retornar datos mock como fallback
      return PROGRESS_OVERVIEW_DATA;
    }
  };

export const fetchWeeklyScores = async (): Promise<IWeeklyScore[]> =>
  Promise.resolve(WEEKLY_SCORES);

export const fetchFocusAreas = async (): Promise<IFocusArea[]> =>
  Promise.resolve(FOCUS_AREAS);

export const fetchMilestones = async (): Promise<IMilestone[]> =>
  Promise.resolve(MILESTONES);


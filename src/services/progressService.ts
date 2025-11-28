import {supabase} from '../lib/supabaseClient';
import {getCurrentAuthUser} from './supabaseAuth';
import type {RolePlayScenarioId, RolePlayLevelId} from '../roleplay';

// ============================================================================
// TIPOS DE BASE DE DATOS
// ============================================================================

export type RolePlaySessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type RolePlayMode = 'guided' | 'free';
export type TutorId = 'davide' | 'phoebe';
export type PracticeVerdict = 'correct' | 'needs_improvement' | null;

export interface RolePlaySessionRow {
  id: string;
  user_id: string;
  scenario_id: RolePlayScenarioId;
  level_id: RolePlayLevelId;
  mode: RolePlayMode;
  status: RolePlaySessionStatus;
  completed_at: string | null;
  total_turns: number;
  total_questions: number;
  total_rounds: number;
  duration_seconds: number | null;
  average_score: number | null;
  total_feedback_count: number;
  tutor_id: TutorId | null;
  started_at: string;
  created_at: string;
  updated_at: string;
}

export interface RolePlayRoundRow {
  id: string;
  session_id: string;
  user_id: string;
  round_number: number;
  round_title: string | null;
  status: 'in_progress' | 'completed';
  completed_at: string | null;
  total_questions: number;
  questions_answered: number;
  average_score: number | null;
  started_at: string;
  created_at: string;
  updated_at: string;
}

export interface RolePlayTurnRow {
  id: string;
  session_id: string;
  round_id: string | null;
  user_id: string;
  turn_number: number;
  question_letter: string | null;
  question_text: string;
  user_response_text: string | null;
  feedback_text: string | null;
  verdict: PracticeVerdict;
  score: number | null;
  audio_url: string | null;
  created_at: string;
}

export interface UserProgressSummaryRow {
  user_id: string;
  total_sessions_completed: number;
  total_practice_time_seconds: number;
  total_questions_answered: number;
  total_rounds_completed: number;
  job_interview_sessions: number;
  at_the_cafe_sessions: number;
  daily_small_talk_sessions: number;
  meeting_someone_new_sessions: number;
  beginner_sessions: number;
  intermediate_sessions: number;
  advanced_sessions: number;
  guided_sessions: number;
  free_sessions: number;
  average_score: number | null;
  first_session_at: string | null;
  last_session_at: string | null;
  updated_at: string;
}

// ============================================================================
// TIPOS DE PAYLOAD PARA CREAR/ACTUALIZAR
// ============================================================================

export type CreateSessionPayload = {
  scenario_id: RolePlayScenarioId;
  level_id: RolePlayLevelId;
  mode: RolePlayMode;
  tutor_id?: TutorId;
};

export type UpdateSessionPayload = {
  status?: RolePlaySessionStatus;
  total_turns?: number;
  total_questions?: number;
  total_rounds?: number;
  duration_seconds?: number;
  average_score?: number;
  total_feedback_count?: number;
  completed_at?: string | null;
};

export type CreateRoundPayload = {
  session_id: string;
  round_number: number;
  round_title?: string;
  total_questions: number;
};

export type UpdateRoundPayload = {
  status?: 'in_progress' | 'completed';
  questions_answered?: number;
  average_score?: number;
  completed_at?: string | null;
};

export type CreateTurnPayload = {
  session_id: string;
  round_id?: string | null;
  turn_number: number;
  question_letter?: string | null;
  question_text: string;
  user_response_text?: string | null;
  feedback_text?: string | null;
  verdict?: PracticeVerdict;
  score?: number | null;
  audio_url?: string | null;
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

const getClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Por favor, crea un archivo .env en la raíz del proyecto con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
};

const ensureAuthenticated = async (): Promise<string> => {
  const user = await getCurrentAuthUser();
  if (!user) {
    throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
  }
  return user.id;
};

// ============================================================================
// FUNCIONES DE SESIÓN
// ============================================================================

/**
 * Crea una nueva sesión de role play
 * @returns ID de la sesión creada
 */
export const createSession = async (
  payload: CreateSessionPayload,
): Promise<string> => {
  const userId = await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_sessions')
    .insert({
      user_id: userId,
      scenario_id: payload.scenario_id,
      level_id: payload.level_id,
      mode: payload.mode,
      tutor_id: payload.tutor_id || null,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createSession] Error:', error);
    throw new Error(`Error al crear sesión: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo crear la sesión');
  }

  return data.id;
};

/**
 * Obtiene una sesión por ID
 */
export const getSession = async (
  sessionId: string,
): Promise<RolePlaySessionRow | null> => {
  await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('[getSession] Error:', error);
    throw new Error(`Error al obtener sesión: ${error.message}`);
  }

  return data;
};

/**
 * Actualiza una sesión
 */
export const updateSession = async (
  sessionId: string,
  payload: UpdateSessionPayload,
): Promise<RolePlaySessionRow> => {
  await ensureAuthenticated();
  const client = getClient();

  const updateData: Partial<RolePlaySessionRow> = {...payload};
  if (payload.completed_at === undefined && payload.status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const {data, error} = await client
    .from('role_play_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('[updateSession] Error:', error);
    throw new Error(`Error al actualizar sesión: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo actualizar la sesión');
  }

  return data;
};

/**
 * Marca una sesión como completada
 */
export const completeSession = async (
  sessionId: string,
  metrics: {
    total_turns: number;
    total_questions: number;
    total_rounds?: number;
    duration_seconds: number;
    average_score?: number;
  },
): Promise<RolePlaySessionRow> => {
  return updateSession(sessionId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    ...metrics,
  });
};

// ============================================================================
// FUNCIONES DE ROUNDS
// ============================================================================

/**
 * Crea un nuevo round
 */
export const createRound = async (
  payload: CreateRoundPayload,
): Promise<string> => {
  const userId = await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_rounds')
    .insert({
      user_id: userId,
      session_id: payload.session_id,
      round_number: payload.round_number,
      round_title: payload.round_title || null,
      total_questions: payload.total_questions,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createRound] Error:', error);
    throw new Error(`Error al crear round: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo crear el round');
  }

  return data.id;
};

/**
 * Actualiza un round
 */
export const updateRound = async (
  roundId: string,
  payload: UpdateRoundPayload,
): Promise<RolePlayRoundRow> => {
  await ensureAuthenticated();
  const client = getClient();

  const updateData: Partial<RolePlayRoundRow> = {...payload};
  if (
    payload.completed_at === undefined &&
    payload.status === 'completed'
  ) {
    updateData.completed_at = new Date().toISOString();
  }

  const {data, error} = await client
    .from('role_play_rounds')
    .update(updateData)
    .eq('id', roundId)
    .select()
    .single();

  if (error) {
    console.error('[updateRound] Error:', error);
    throw new Error(`Error al actualizar round: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo actualizar el round');
  }

  return data;
};

/**
 * Marca un round como completado
 */
export const completeRound = async (
  roundId: string,
  questionsAnswered: number,
  averageScore?: number,
): Promise<RolePlayRoundRow> => {
  return updateRound(roundId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    questions_answered: questionsAnswered,
    average_score: averageScore ?? undefined,
  });
};

// ============================================================================
// FUNCIONES DE TURNS
// ============================================================================

/**
 * Crea un nuevo turno
 */
export const createTurn = async (
  payload: CreateTurnPayload,
): Promise<string> => {
  const userId = await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_turns')
    .insert({
      user_id: userId,
      session_id: payload.session_id,
      round_id: payload.round_id || null,
      turn_number: payload.turn_number,
      question_letter: payload.question_letter || null,
      question_text: payload.question_text,
      user_response_text: payload.user_response_text || null,
      feedback_text: payload.feedback_text || null,
      verdict: payload.verdict || null,
      score: payload.score || null,
      audio_url: payload.audio_url || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createTurn] Error:', error);
    throw new Error(`Error al crear turno: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo crear el turno');
  }

  return data.id;
};

/**
 * Obtiene todos los turnos de una sesión
 */
export const getSessionTurns = async (
  sessionId: string,
): Promise<RolePlayTurnRow[]> => {
  await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_number', {ascending: true});

  if (error) {
    console.error('[getSessionTurns] Error:', error);
    throw new Error(`Error al obtener turnos: ${error.message}`);
  }

  return data || [];
};

// ============================================================================
// FUNCIONES DE PROGRESO
// ============================================================================

/**
 * Obtiene el resumen de progreso del usuario actual
 */
export const getUserProgressSummary = async (): Promise<UserProgressSummaryRow | null> => {
  const userId = await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('user_progress_summary')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[getUserProgressSummary] Error:', error);
    throw new Error(`Error al obtener progreso: ${error.message}`);
  }

  return data;
};

/**
 * Obtiene el historial de sesiones completadas
 */
export const getSessionHistory = async (
  limit: number = 10,
): Promise<RolePlaySessionRow[]> => {
  await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_sessions')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', {ascending: false})
    .limit(limit);

  if (error) {
    console.error('[getSessionHistory] Error:', error);
    throw new Error(`Error al obtener historial: ${error.message}`);
  }

  return data || [];
};

/**
 * Obtiene estadísticas por escenario
 */
export const getScenarioStats = async (
  scenarioId: RolePlayScenarioId,
): Promise<{
  total_sessions: number;
  average_score: number | null;
  total_time_seconds: number;
}> => {
  await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_sessions')
    .select('average_score, duration_seconds')
    .eq('scenario_id', scenarioId)
    .eq('status', 'completed');

  if (error) {
    console.error('[getScenarioStats] Error:', error);
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }

  const sessions = data || [];
  const total_sessions = sessions.length;
  const total_time_seconds = sessions.reduce(
    (sum, s) => sum + (s.duration_seconds || 0),
    0,
  );
  const scores = sessions
    .map(s => s.average_score)
    .filter((s): s is number => s !== null);
  const average_score =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : null;

  return {
    total_sessions,
    average_score,
    total_time_seconds,
  };
};

/**
 * Obtiene estadísticas por nivel
 */
export const getLevelStats = async (): Promise<{
  beginner: number;
  intermediate: number;
  advanced: number;
}> => {
  await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_sessions')
    .select('level_id')
    .eq('status', 'completed');

  if (error) {
    console.error('[getLevelStats] Error:', error);
    throw new Error(`Error al obtener estadísticas por nivel: ${error.message}`);
  }

  const sessions = data || [];
  const stats = {
    beginner: sessions.filter(s => s.level_id === 'beginner').length,
    intermediate: sessions.filter(s => s.level_id === 'intermediate').length,
    advanced: sessions.filter(s => s.level_id === 'advanced').length,
  };

  return stats;
};

/**
 * Obtiene estadísticas por escenario (sesiones completadas)
 */
export const getAllScenarioStats = async (): Promise<
  Record<RolePlayScenarioId, number>
> => {
  await ensureAuthenticated();
  const client = getClient();

  const {data, error} = await client
    .from('role_play_sessions')
    .select('scenario_id')
    .eq('status', 'completed');

  if (error) {
    console.error('[getAllScenarioStats] Error:', error);
    throw new Error(`Error al obtener estadísticas por escenario: ${error.message}`);
  }

  const sessions = data || [];
  const stats: Record<RolePlayScenarioId, number> = {
    jobInterview: sessions.filter(s => s.scenario_id === 'jobInterview').length,
    atTheCafe: sessions.filter(s => s.scenario_id === 'atTheCafe').length,
    dailySmallTalk: sessions.filter(s => s.scenario_id === 'dailySmallTalk').length,
    meetingSomeoneNew: sessions.filter(s => s.scenario_id === 'meetingSomeoneNew').length,
  };

  return stats;
};

/**
 * Obtiene rounds completados por escenario y nivel
 * Cuenta todos los rounds completados, independientemente del estado de la sesión
 */
export const getRoundsByScenarioAndLevel = async (
  scenarioId: RolePlayScenarioId,
  levelId: RolePlayLevelId,
): Promise<number> => {
  await ensureAuthenticated();
  const client = getClient();

  // Primero obtener las sesiones del escenario y nivel (cualquier estado)
  const {data: sessions, error: sessionsError} = await client
    .from('role_play_sessions')
    .select('id')
    .eq('scenario_id', scenarioId)
    .eq('level_id', levelId);

  if (sessionsError) {
    console.error('[getRoundsByScenarioAndLevel] Error:', sessionsError);
    throw new Error(`Error al obtener sesiones: ${sessionsError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return 0;
  }

  const sessionIds = sessions.map(s => s.id);

  // Luego contar los rounds completados de esas sesiones
  const {data: rounds, error: roundsError} = await client
    .from('role_play_rounds')
    .select('id')
    .in('session_id', sessionIds)
    .eq('status', 'completed');

  if (roundsError) {
    console.error('[getRoundsByScenarioAndLevel] Error:', roundsError);
    throw new Error(`Error al obtener rounds: ${roundsError.message}`);
  }

  return rounds?.length || 0;
};

/**
 * Obtiene todos los rounds completados por escenario (suma de todos los niveles)
 * Cuenta todos los rounds completados, independientemente del estado de la sesión
 */
export const getRoundsByScenario = async (
  scenarioId: RolePlayScenarioId,
): Promise<number> => {
  await ensureAuthenticated();
  const client = getClient();

  // Obtener todas las sesiones del escenario (todos los niveles, cualquier estado)
  const {data: sessions, error: sessionsError} = await client
    .from('role_play_sessions')
    .select('id')
    .eq('scenario_id', scenarioId);

  if (sessionsError) {
    console.error('[getRoundsByScenario] Error:', sessionsError);
    throw new Error(`Error al obtener sesiones: ${sessionsError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return 0;
  }

  const sessionIds = sessions.map(s => s.id);

  // Contar rounds completados (de cualquier sesión del escenario)
  const {data: rounds, error: roundsError} = await client
    .from('role_play_rounds')
    .select('id')
    .in('session_id', sessionIds)
    .eq('status', 'completed');

  if (roundsError) {
    console.error('[getRoundsByScenario] Error:', roundsError);
    throw new Error(`Error al obtener rounds: ${roundsError.message}`);
  }

  return rounds?.length || 0;
};

/**
 * Obtiene todos los rounds completados por escenario (retorna objeto con todos los escenarios)
 */
export const getAllRoundsByScenario = async (): Promise<
  Record<RolePlayScenarioId, number>
> => {
  await ensureAuthenticated();
  
  const [jobInterview, atTheCafe, dailySmallTalk, meetingSomeoneNew] = await Promise.all([
    getRoundsByScenario('jobInterview'),
    getRoundsByScenario('atTheCafe'),
    getRoundsByScenario('dailySmallTalk'),
    getRoundsByScenario('meetingSomeoneNew'),
  ]);

  return {
    jobInterview,
    atTheCafe,
    dailySmallTalk,
    meetingSomeoneNew,
  };
};

/**
 * Obtiene detalles de rounds completados por escenario y nivel
 * Retorna información sobre qué rounds se han completado
 */
export const getRoundsDetailsByScenario = async (
  scenarioId: RolePlayScenarioId,
): Promise<{
  totalRounds: number;
  completedRounds: number;
  roundsByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}> => {
  await ensureAuthenticated();
  const client = getClient();

  // Obtener todas las sesiones del escenario (cualquier estado)
  const {data: sessions, error: sessionsError} = await client
    .from('role_play_sessions')
    .select('id, level_id')
    .eq('scenario_id', scenarioId);

  if (sessionsError) {
    console.error('[getRoundsDetailsByScenario] Error:', sessionsError);
    throw new Error(`Error al obtener sesiones: ${sessionsError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return {
      totalRounds: 9, // 3 niveles × 3 rounds
      completedRounds: 0,
      roundsByLevel: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
    };
  }

  const sessionIds = sessions.map(s => s.id);

  // Obtener rounds completados con información de nivel
  const {data: rounds, error: roundsError} = await client
    .from('role_play_rounds')
    .select('id, session_id, round_number')
    .in('session_id', sessionIds)
    .eq('status', 'completed');

  if (roundsError) {
    console.error('[getRoundsDetailsByScenario] Error:', roundsError);
    throw new Error(`Error al obtener rounds: ${roundsError.message}`);
  }

  // Agrupar rounds por nivel
  const roundsByLevel = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  rounds?.forEach(round => {
    const session = sessions.find(s => s.id === round.session_id);
    if (session) {
      const level = session.level_id as 'beginner' | 'intermediate' | 'advanced';
      if (level in roundsByLevel) {
        roundsByLevel[level]++;
      }
    }
  });

  return {
    totalRounds: 9, // 3 niveles × 3 rounds por nivel
    completedRounds: rounds?.length || 0,
    roundsByLevel,
  };
};

/**
 * Obtiene todos los rounds completados por escenario y nivel (retorna objeto completo)
 */
export const getAllRoundsByScenarioAndLevel = async (): Promise<
  Record<RolePlayScenarioId, Record<RolePlayLevelId, number>>
> => {
  await ensureAuthenticated();
  
  const scenarios: RolePlayScenarioId[] = ['jobInterview', 'atTheCafe', 'dailySmallTalk', 'meetingSomeoneNew'];
  const levels: RolePlayLevelId[] = ['beginner', 'intermediate', 'advanced'];
  
  const result: Record<RolePlayScenarioId, Record<RolePlayLevelId, number>> = {
    jobInterview: {beginner: 0, intermediate: 0, advanced: 0},
    atTheCafe: {beginner: 0, intermediate: 0, advanced: 0},
    dailySmallTalk: {beginner: 0, intermediate: 0, advanced: 0},
    meetingSomeoneNew: {beginner: 0, intermediate: 0, advanced: 0},
  };

  // Ejecutar todas las consultas en paralelo
  const promises = scenarios.flatMap(scenarioId =>
    levels.map(async levelId => {
      const count = await getRoundsByScenarioAndLevel(scenarioId, levelId);
      result[scenarioId][levelId] = count;
    })
  );

  await Promise.all(promises);

  return result;
};


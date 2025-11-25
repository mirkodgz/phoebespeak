/**
 * Factory principal para obtener prompts según escenario, nivel y modo
 * Este es el punto de entrada único para todos los prompts
 */

import type {
  RolePlayScenarioId,
  RolePlayLevelId,
  RolePlayMode,
  PromptConfig,
  PromptContext,
  RoundConfig,
} from './types';
import {scenarioConfigs} from '../scenarios';
import {
  getJobInterviewBeginnerGuidedPrompt,
  getJobInterviewBeginnerGuidedRoundPrompt,
  getJobInterviewBeginnerFreePrompt,
  getJobInterviewIntermediateGuidedPrompt,
  getJobInterviewIntermediateGuidedRoundPrompt,
  getJobInterviewIntermediateFreePrompt,
  getJobInterviewAdvancedGuidedPrompt,
  getJobInterviewAdvancedGuidedRoundPrompt,
  getJobInterviewAdvancedFreePrompt,
} from './scenarios/jobInterview';
import {
  getAtTheCafeBeginnerGuidedRoundPrompt,
  getAtTheCafeIntermediateGuidedRoundPrompt,
  getAtTheCafeAdvancedGuidedRoundPrompt,
} from './scenarios/atTheCafe';
import {
  getDailySmallTalkBeginnerGuidedRoundPrompt,
  getDailySmallTalkIntermediateGuidedRoundPrompt,
  getDailySmallTalkAdvancedGuidedRoundPrompt,
} from './scenarios/dailySmallTalk';
import {
  getMeetingSomeoneNewBeginnerGuidedRoundPrompt,
  getMeetingSomeoneNewIntermediateGuidedRoundPrompt,
  getMeetingSomeoneNewAdvancedGuidedRoundPrompt,
} from './scenarios/meetingSomeoneNew';

export interface GetPromptParams {
  scenarioId: RolePlayScenarioId;
  levelId: RolePlayLevelId;
  mode: RolePlayMode;
  context: PromptContext;
  predefinedQuestion?: string;
  roundNumber?: number;
}

/**
 * Obtiene el prompt correcto según todos los parámetros
 */
export const getPrompt = (params: GetPromptParams): PromptConfig => {
  const {scenarioId, levelId, mode, context, predefinedQuestion, roundNumber} =
    params;

  // Obtener configuración del escenario
  const scenarioConfig = scenarioConfigs[scenarioId];
  if (!scenarioConfig) {
    throw new Error(`Scenario ${scenarioId} not found`);
  }

  // Determinar si hay rounds disponibles para este nivel
  const roundsForLevel = getRoundsForLevel(scenarioConfig.rounds, levelId);
  const hasRounds = Boolean(roundsForLevel && roundsForLevel.length > 0);

  // Si hay pregunta predefinida (rounds), usar prompt específico de rounds
  if (mode === 'guided' && predefinedQuestion && hasRounds) {
    return getGuidedRoundPrompt(scenarioId, levelId, context, predefinedQuestion);
  }

  // Si no hay rounds o es modo libre, usar prompt normal
  return getStandardPrompt(scenarioId, levelId, mode, context);
};

/**
 * Obtiene prompt para modo guidato con rounds
 */
const getGuidedRoundPrompt = (
  scenarioId: RolePlayScenarioId,
  levelId: RolePlayLevelId,
  context: PromptContext,
  predefinedQuestion: string,
): PromptConfig => {
  if (scenarioId === 'jobInterview') {
    if (levelId === 'beginner') {
      return getJobInterviewBeginnerGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'intermediate') {
      return getJobInterviewIntermediateGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'advanced') {
      return getJobInterviewAdvancedGuidedRoundPrompt(context, predefinedQuestion);
    }
  }

  if (scenarioId === 'atTheCafe') {
    if (levelId === 'beginner') {
      return getAtTheCafeBeginnerGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'intermediate') {
      return getAtTheCafeIntermediateGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'advanced') {
      return getAtTheCafeAdvancedGuidedRoundPrompt(context, predefinedQuestion);
    }
  }

  if (scenarioId === 'dailySmallTalk') {
    if (levelId === 'beginner') {
      return getDailySmallTalkBeginnerGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'intermediate') {
      return getDailySmallTalkIntermediateGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'advanced') {
      return getDailySmallTalkAdvancedGuidedRoundPrompt(context, predefinedQuestion);
    }
  }

  if (scenarioId === 'meetingSomeoneNew') {
    if (levelId === 'beginner') {
      return getMeetingSomeoneNewBeginnerGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'intermediate') {
      return getMeetingSomeoneNewIntermediateGuidedRoundPrompt(context, predefinedQuestion);
    }
    if (levelId === 'advanced') {
      return getMeetingSomeoneNewAdvancedGuidedRoundPrompt(context, predefinedQuestion);
    }
  }

  // Fallback: si hay pregunta predefinida pero no hay prompt específico de round,
  // usar el prompt normal (esto puede pasar en otros escenarios que aún no tienen rounds)
  return getStandardPrompt(scenarioId, levelId, 'guided', context);
};

/**
 * Obtiene prompt estándar (sin rounds)
 */
const getStandardPrompt = (
  scenarioId: RolePlayScenarioId,
  levelId: RolePlayLevelId,
  mode: RolePlayMode,
  context: PromptContext,
): PromptConfig => {
  // Job Interview
  if (scenarioId === 'jobInterview') {
    if (mode === 'guided') {
      switch (levelId) {
        case 'beginner':
          return getJobInterviewBeginnerGuidedPrompt(context);
        case 'intermediate':
          return getJobInterviewIntermediateGuidedPrompt(context);
        case 'advanced':
          return getJobInterviewAdvancedGuidedPrompt(context);
      }
    } else {
      // mode === 'free'
      const turnNumber = context.turnNumber || 1;
      switch (levelId) {
        case 'beginner':
          return getJobInterviewBeginnerFreePrompt(context, turnNumber);
        case 'intermediate':
          return getJobInterviewIntermediateFreePrompt(context, turnNumber);
        case 'advanced':
          return getJobInterviewAdvancedFreePrompt(context, turnNumber);
      }
    }
  }

  // TODO: Agregar otros escenarios cuando estén listos
  // if (scenarioId === 'atTheCafe') { ... }
  // if (scenarioId === 'dailySmallTalk') { ... }
  // if (scenarioId === 'meetingSomeoneNew') { ... }

  throw new Error(
    `Prompt not implemented for scenario: ${scenarioId}, level: ${levelId}, mode: ${mode}`,
  );
};

/**
 * Obtiene los rounds de un escenario para un nivel específico
 */
export const getScenarioRounds = (
  scenarioId: RolePlayScenarioId,
  levelId: RolePlayLevelId,
): RoundConfig[] => {
  const scenarioConfig = scenarioConfigs[scenarioId];
  return getRoundsForLevel(scenarioConfig?.rounds, levelId) || [];
};

/**
 * Helper para obtener rounds de un nivel específico
 * Soporta tanto la estructura antigua (array) como la nueva (objeto por nivel)
 */
const getRoundsForLevel = (
  rounds: RoundConfig[] | Record<RolePlayLevelId, RoundConfig[]> | undefined,
  levelId: RolePlayLevelId,
): RoundConfig[] | undefined => {
  if (!rounds) {
    return undefined;
  }

  // Si es un array (estructura antigua), devolverlo directamente
  if (Array.isArray(rounds)) {
    return rounds;
  }

  // Si es un objeto (estructura nueva), devolver los rounds del nivel específico
  return rounds[levelId];
};


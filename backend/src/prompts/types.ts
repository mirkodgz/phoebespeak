/**
 * Tipos TypeScript para el sistema de prompts
 */

export type RolePlayScenarioId =
  | 'jobInterview'
  | 'atTheCafe'
  | 'dailySmallTalk'
  | 'meetingSomeoneNew';

export type RolePlayLevelId = 'beginner' | 'intermediate' | 'advanced';

export type RolePlayMode = 'guided' | 'free';

export interface PromptContext {
  studentName: string;
  conversationHistory: Array<{
    role: 'tutor' | 'user' | 'feedback';
    text: string;
  }>;
  turnNumber?: number;
  roundNumber?: number;
  questionIndex?: number;
  predefinedQuestion?: string;
  companyName?: string;
  positionName?: string;
  transcript?: string;
  targetSentence?: string;
  transcriptionSegments?: Array<{
    text: string;
    confidence?: number;
    start?: number;
    end?: number;
  }>;
}

export interface PromptConfig {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'json_object' | 'text';
}

export interface RoundQuestion {
  letter: string;
  question: (studentName: string) => string;
  exampleAnswer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  expectedTopics?: string[];
}

export interface RoundConfig {
  id: number;
  title: string;
  description?: string;
  questions: RoundQuestion[];
  promptOverrides?: {
    feedbackStyle?: 'detailed' | 'brief' | 'encouraging';
    focusAreas?: string[];
  };
}

export interface ScenarioConfig {
  id: RolePlayScenarioId;
  title: string;
  rounds?: RoundConfig[] | Record<RolePlayLevelId, RoundConfig[]>;
}


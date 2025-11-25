export type RolePlayScenarioId =
  | 'jobInterview'
  | 'atTheCafe'
  | 'dailySmallTalk'
  | 'meetingSomeoneNew';

export type RolePlayLevelId = 'beginner' | 'intermediate' | 'advanced';

export type ConversationPair = {
  tutor: (studentName: string) => string;
  user: (studentName: string) => string;
};

export type ConversationFlowMode = 'static' | 'dynamic' | 'hybrid';

export interface RoundQuestion {
  letter: string; // A, B, C, D, E
  question: (studentName: string) => string;
  exampleAnswer: string;
}

export interface Round {
  id: number;
  title: string;
  questions: RoundQuestion[];
}

export interface ConversationFlowConfig {
  mode: ConversationFlowMode;
  initialGreeting: (studentName: string) => string;
  firstQuestion: (studentName: string) => string;
  followUpQuestions?: Array<(studentName: string) => string>; // Preguntas de seguimiento predefinidas
  maxTurns?: number; // Límite de turnos para conversaciones dinámicas
  rounds?: Round[]; // Para escenarios con rounds (ej: Job Interview)
}

export interface RolePlayLevel {
  id: RolePlayLevelId;
  label: string;
  conversation?: readonly ConversationPair[]; // Opcional para flujos dinámicos
  flowConfig?: ConversationFlowConfig; // Para flujos dinámicos
  // Al menos uno de conversation o flowConfig debe estar presente
}

export interface RolePlayScenarioConfig {
  id: RolePlayScenarioId;
  title: string;
  introEn: string;
  introIt: string;
  levels: readonly RolePlayLevel[];
}



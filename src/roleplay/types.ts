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

export interface ConversationFlowConfig {
  mode: ConversationFlowMode;
  initialGreeting: (studentName: string) => string;
  firstQuestion: (studentName: string) => string;
  followUpQuestions?: Array<(studentName: string) => string>; // Preguntas de seguimiento predefinidas
  maxTurns?: number; // Límite de turnos para conversaciones dinámicas
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



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

export interface RolePlayLevel {
  id: RolePlayLevelId;
  label: string;
  conversation: readonly ConversationPair[];
}

export interface RolePlayScenarioConfig {
  id: RolePlayScenarioId;
  title: string;
  introEn: string;
  introIt: string;
  levels: readonly RolePlayLevel[];
}



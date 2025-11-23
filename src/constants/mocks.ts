import {
  IDashboardData,
  IDailyGoal,
  IFocusArea,
  ILessonRecommendation,
  IMilestone,
  IPracticeHistoryItem,
  IPracticeSessionData,
  IProgressOverviewData,
  IQuickAction,
  IUser,
  IUserPreferences,
  IWeeklyScore,
} from './types';

export const USERS: IUser[] = [
  {
    id: 'marco',
    name: 'Marco Bianchi',
    department: 'Project Manager · Milano',
    about:
      'Appassionato di lingue e tecnologia. Ti aiuto a trasformare la pronuncia inglese in un superpotere quotidiano.',
    avatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=160&h=160&q=80',
  },
];

export const DAILY_GOALS: IDailyGoal[] = [
  {id: 'speaking', label: 'Conversazione', progress: 65, targetMinutes: 15},
  {id: 'listening', label: 'Ascolto attivo', progress: 48, targetMinutes: 10},
  {id: 'vocabulary', label: 'Vocabolario', progress: 82, targetMinutes: 5},
];

export const LESSON_RECOMMENDATIONS: ILessonRecommendation[] = [
  {
    id: 'business-english',
    title: 'Business English',
    subtitle: 'Pronuncia per riunioni',
    icon: 'office',
    durationMinutes: 7,
  },
  {
    id: 'travel',
    title: 'Travel Talk',
    subtitle: 'Simulazione aeroporto',
    icon: 'flight',
    durationMinutes: 6,
  },
  {
    id: 'small-talk',
    title: 'Small Talk',
    subtitle: 'Espressioni quotidiane',
    icon: 'chat',
    durationMinutes: 5,
  },
];

export const QUICK_ACTIONS: IQuickAction[] = [
  {id: 'daily-coach', label: 'Coach Giornaliero', description: 'Feedback rapido'},
  {id: 'benchmark', label: 'Valutazione rapida', description: '2 minuti focus'},
  {id: 'review', label: 'Ripasso errori', description: 'Pronuncia mirata'},
];

export const DASHBOARD_DATA: IDashboardData = {
  dailyGoals: DAILY_GOALS,
  lessons: LESSON_RECOMMENDATIONS,
  quickActions: QUICK_ACTIONS,
};

export const PRACTICE_HISTORY: IPracticeHistoryItem[] = [
  {
    id: 'attempt-1',
    sentence: 'I would like to schedule a meeting...',
    score: 82,
    date: '2025-11-02T09:30:00Z',
  },
  {
    id: 'attempt-2',
    sentence: 'Have you finished the report?',
    score: 88,
    date: '2025-11-04T18:10:00Z',
  },
  {
    id: 'attempt-3',
    sentence: 'Can we reschedule our call?',
    score: 94,
    date: '2025-11-06T07:45:00Z',
  },
];

export const PRACTICE_SESSION_DATA: IPracticeSessionData = {
  tutorName: 'Tutor IA · Marco',
  tutorAvatar: 'avatar1',
  coachMessage: '“Ascolta bene il ritmo della frase e prova a replicarlo.”',
  targetSentence:
    'I would like to schedule a meeting with the marketing team tomorrow morning.',
  phonemeHints: [
    {
      id: 'th',
      label: 'Suono /ð/',
      hint: 'Lingua fra i denti, vibrazione leggera con flusso d’aria costante.',
    },
    {
      id: 'r',
      label: 'R inglese',
      hint: 'Arrotonda le labbra e solleva la lingua senza toccare il palato.',
    },
  ],
  lastScore: 92,
  history: PRACTICE_HISTORY,
};

export const WEEKLY_SCORES: IWeeklyScore[] = [
  {id: 'mon', label: 'Lun', value: 68},
  {id: 'tue', label: 'Mar', value: 72},
  {id: 'wed', label: 'Mer', value: 85},
  {id: 'thu', label: 'Gio', value: 78},
  {id: 'fri', label: 'Ven', value: 91},
  {id: 'sat', label: 'Sab', value: 88},
  {id: 'sun', label: 'Dom', value: 74},
];

export const FOCUS_AREAS: IFocusArea[] = [
  {id: 'intonation', label: 'Intonazione', score: 72, trend: 'up'},
  {id: 'phonetics', label: 'Fonemi complessi', score: 66, trend: 'steady'},
  {id: 'fluency', label: 'Fluenza', score: 81, trend: 'up'},
  {id: 'confidence', label: 'Confidenza', score: 58, trend: 'down'},
];

export const MILESTONES: IMilestone[] = [
  {
    id: 'streak',
    title: 'Streak attuale',
    value: '5 giorni',
    description: 'Continua così! A 7 giorni sblocchi un premio extra.',
  },
  {
    id: 'hours',
    title: 'Tempo di pratica',
    value: '2h 45m',
    description: 'Top 10% della community questa settimana.',
  },
  {
    id: 'badges',
    title: 'Badge conquistati',
    value: '12',
    description: 'Completa 3 sessioni consecutive per il prossimo badge.',
  },
];

export const PROGRESS_OVERVIEW_DATA: IProgressOverviewData = {
  weeklyScores: WEEKLY_SCORES,
  focusAreas: FOCUS_AREAS,
  milestones: MILESTONES,
};

export const USER_PREFERENCES: IUserPreferences = {
  accent: 'US · Neutral',
  targetLevel: 'Business C1',
  remindersEnabled: true,
  selectedTutor: 'davide',
};

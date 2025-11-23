import {ImageSourcePropType} from 'react-native';
import {Dispatch, SetStateAction} from 'react';
import {ITheme, ThemeAssets, ThemeIcons} from './theme';

export * from './components';
export * from './theme';

export interface IUser {
  id: number | string;
  name?: string;
  department?: string;
  avatar?: string;
  stats?: {posts?: number; followers?: number; following?: number};
  social?: {twitter?: string; dribbble?: string};
  about?: string;
}

export interface ICategory {
  id?: number;
  name?: string;
}
export interface IArticleOptions {
  id?: number;
  title?: string;
  description?: string;
  type?: 'room' | 'apartment' | 'house'; // private room | entire apartment | entire house
  sleeping?: {total?: number; type?: 'sofa' | 'bed'};
  guests?: number;
  price?: number;
  user?: IUser;
  image?: string;
}
export interface IArticle {
  id?: number;
  title?: string;
  description?: string;
  category?: ICategory;
  image?: string;
  location?: ILocation;
  rating?: number;
  user?: IUser;
  offers?: IProduct[];
  options?: IArticleOptions[];
  timestamp?: number;
  onPress?: (event?: any) => void;
}

export interface IProduct {
  id?: number;
  title?: string;
  description?: string;
  image?: string;
  timestamp?: number;
  linkLabel?: string;
  type: 'vertical' | 'horizontal';
}
export interface ILocation {
  id?: number;
  city?: string;
  country?: string;
}
export interface IDailyGoal {
  id: string;
  label: string;
  progress: number;
  targetMinutes?: number;
}

export interface ILessonRecommendation {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof ThemeIcons;
  durationMinutes?: number;
}

export interface IQuickAction {
  id: string;
  label: string;
  description?: string;
  icon?: keyof ThemeIcons;
}

export interface IDashboardData {
  dailyGoals: IDailyGoal[];
  lessons: ILessonRecommendation[];
  quickActions: IQuickAction[];
}

export interface IPhonemeHint {
  id: string;
  label: string;
  hint: string;
}

export interface IPracticeHistoryItem {
  id: string;
  sentence: string;
  score: number;
  date: string;
}

export interface IPracticeSessionData {
  tutorName: string;
  tutorAvatar: keyof ThemeAssets;
  coachMessage: string;
  targetSentence: string;
  phonemeHints: IPhonemeHint[];
  lastScore: number;
  history: IPracticeHistoryItem[];
}

export interface IWeeklyScore {
  id: string;
  label: string;
  value: number;
}

export interface IFocusArea {
  id: string;
  label: string;
  score: number;
  trend?: 'up' | 'down' | 'steady';
}

export interface IMilestone {
  id: string;
  title: string;
  value: string;
  description: string;
}

export interface IProgressOverviewData {
  weeklyScores: IWeeklyScore[];
  focusAreas: IFocusArea[];
  milestones: IMilestone[];
}

export interface IUserPreferences {
  accent: string;
  targetLevel: string;
  remindersEnabled: boolean;
  selectedTutor?: 'davide' | 'phoebe';
}

export interface IUseData {
  isDark: boolean;
  handleIsDark: (isDark?: boolean) => void;
  theme: ITheme;
  setTheme: Dispatch<SetStateAction<ITheme>>;
  isAuthenticated: boolean;
  hasActiveTrial: boolean;
  isProfileLoading: boolean;
  signIn: (credentials: {email: string; password: string}) => Promise<void>;
  signUp: (payload: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<'confirmation_required' | 'signed_in'>;
  signOut: () => Promise<void>;
  activateTrial: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasOnboarded: boolean;
  completeOnboarding: () => void;
  user: IUser;
  setUser: (data: Partial<IUser>) => void;
  dashboard: IDashboardData;
  setDashboard: Dispatch<SetStateAction<IDashboardData>>;
  practice: IPracticeSessionData;
  setPractice: Dispatch<SetStateAction<IPracticeSessionData>>;
  progress: IProgressOverviewData;
  setProgress: Dispatch<SetStateAction<IProgressOverviewData>>;
  preferences: IUserPreferences;
  updatePreferences: (data: Partial<IUserPreferences>) => void;
}

export interface ITranslate {
  locale: string;
  setLocale: (locale?: string) => void;
  t: (scope?: string | string[], options?: object) => string;
  translate: (scope?: string | string[], options?: object) => string;
}
export interface IExtra {
  id?: number;
  name?: string;
  time?: string;
  image: ImageSourcePropType;
  saved?: boolean;
  booked?: boolean;
  available?: boolean;
  onBook?: () => void;
  onSave?: () => void;
  onTimeSelect?: (id?: number) => void;
}

export interface IBasketItem {
  id?: number;
  image?: string;
  title?: string;
  description?: string;
  stock?: boolean;
  price?: number;
  qty?: number;
  qtys?: number[];
  size?: number | string;
  sizes?: number[] | string[];
}

export interface IBasket {
  subtotal?: number;
  items?: IBasketItem[];
  recommendations?: IBasketItem[];
}

export interface INotification {
  id?: number;
  subject?: string;
  message?: string;
  read?: boolean;
  business?: boolean;
  createdAt?: number | Date;
  type:
    | 'document'
    | 'documentation'
    | 'payment'
    | 'notification'
    | 'profile'
    | 'extras'
    | 'office';
}

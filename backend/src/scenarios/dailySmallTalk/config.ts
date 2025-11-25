/**
 * Configuración general del escenario Daily Small Talk
 */

import {ScenarioConfig} from '../../prompts/types';
import {dailySmallTalkBeginnerRounds} from './rounds/beginner';
import {dailySmallTalkIntermediateRounds} from './rounds/intermediate';
import {dailySmallTalkAdvancedRounds} from './rounds/advanced';

export const dailySmallTalkConfig: ScenarioConfig = {
  id: 'dailySmallTalk',
  title: 'Daily Small Talk',
  rounds: {
    beginner: dailySmallTalkBeginnerRounds,
    intermediate: dailySmallTalkIntermediateRounds,
    advanced: dailySmallTalkAdvancedRounds,
  },
};


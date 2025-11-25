/**
 * Exporta todas las configuraciones de escenarios
 */

import {jobInterviewConfig} from './jobInterview/config';
import {atTheCafeConfig} from './atTheCafe/config';
import {dailySmallTalkConfig} from './dailySmallTalk/config';
import {meetingSomeoneNewConfig} from './meetingSomeoneNew/config';

export const scenarioConfigs = {
  jobInterview: jobInterviewConfig,
  atTheCafe: atTheCafeConfig,
  dailySmallTalk: dailySmallTalkConfig,
  meetingSomeoneNew: meetingSomeoneNewConfig,
};

export type {ScenarioConfig} from '../prompts/types';


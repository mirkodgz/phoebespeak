/**
 * Configuración general del escenario Job Interview
 */

import {ScenarioConfig} from '../../prompts/types';
import {jobInterviewBeginnerRounds} from './rounds/beginner';
import {jobInterviewIntermediateRounds} from './rounds/intermediate';
import {jobInterviewAdvancedRounds} from './rounds/advanced';

export const jobInterviewConfig: ScenarioConfig = {
  id: 'jobInterview',
  title: 'Job Interview',
  rounds: {
    beginner: jobInterviewBeginnerRounds,
    intermediate: jobInterviewIntermediateRounds,
    advanced: jobInterviewAdvancedRounds,
  },
};


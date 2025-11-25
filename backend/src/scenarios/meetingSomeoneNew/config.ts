/**
 * Configuración general del escenario Meeting Someone New
 */

import {ScenarioConfig} from '../../prompts/types';
import {meetingSomeoneNewBeginnerRounds} from './rounds/beginner';
import {meetingSomeoneNewIntermediateRounds} from './rounds/intermediate';
import {meetingSomeoneNewAdvancedRounds} from './rounds/advanced';

export const meetingSomeoneNewConfig: ScenarioConfig = {
  id: 'meetingSomeoneNew',
  title: 'Meeting Someone New',
  rounds: {
    beginner: meetingSomeoneNewBeginnerRounds,
    intermediate: meetingSomeoneNewIntermediateRounds,
    advanced: meetingSomeoneNewAdvancedRounds,
  },
};


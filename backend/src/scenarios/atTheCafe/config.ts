/**
 * Configuración general del escenario At The Café
 */

import {ScenarioConfig} from '../../prompts/types';
import {atTheCafeBeginnerRounds} from './rounds/beginner';
import {atTheCafeIntermediateRounds} from './rounds/intermediate';
import {atTheCafeAdvancedRounds} from './rounds/advanced';

export const atTheCafeConfig: ScenarioConfig = {
  id: 'atTheCafe',
  title: 'At the Café',
  rounds: {
    beginner: atTheCafeBeginnerRounds,
    intermediate: atTheCafeIntermediateRounds,
    advanced: atTheCafeAdvancedRounds,
  },
};


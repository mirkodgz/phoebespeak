import {jobInterviewScenario} from './scenarios/jobInterview';
import {atTheCafeScenario} from './scenarios/atTheCafe';
import {dailySmallTalkScenario} from './scenarios/dailySmallTalk';
import {meetingSomeoneNewScenario} from './scenarios/meetingSomeoneNew';
import type {RolePlayScenarioConfig, RolePlayScenarioId} from './types';

export const ROLE_PLAY_SCENARIOS: Record<
  RolePlayScenarioId,
  RolePlayScenarioConfig
> = {
  jobInterview: jobInterviewScenario,
  atTheCafe: atTheCafeScenario,
  dailySmallTalk: dailySmallTalkScenario,
  meetingSomeoneNew: meetingSomeoneNewScenario,
};

export {
  jobInterviewScenario,
  atTheCafeScenario,
  dailySmallTalkScenario,
  meetingSomeoneNewScenario,
};
export * from './types';



import {RolePlayScenarioConfig} from '../types';

export const dailySmallTalkScenario: RolePlayScenarioConfig = {
  id: 'dailySmallTalk',
  title: 'Daily Small Talk',
  introEn:
    'You’re chatting with a colleague or a friendly neighbour. Keep it casual and friendly.',
  introIt:
    'Stai chiacchierando con un collega o un vicino. Mantieni un tono semplice e amichevole.',
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      conversation: [
        {
          tutor: (studentName) => `Hi ${studentName}! How are you today?`,
          user: () => 'Hi! How are you?',
        },
        {
          tutor: () => 'I’m good, thanks! And you?',
          user: () => 'I’m fine. It’s sunny today.',
        },
        {
          tutor: () => 'Yes, it is! Do you like warm weather?',
          user: () => 'Yes, I love summer.',
        },
        {
          tutor: () => 'Me too! Are you doing anything fun today?',
          user: () => 'Maybe going for a walk later.',
        },
      ],
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      conversation: [
        {
          tutor: (studentName) =>
            `Hey ${studentName}, how has your week been so far?`,
          user: () => 'It’s been a busy week, but I’m happy it’s Friday.',
        },
        {
          tutor: () => 'I know! Any plans for the weekend?',
          user: () => 'Maybe going out with friends.',
        },
        {
          tutor: () => 'Nice! Do you prefer quiet nights or going out?',
          user: () => 'It depends. Sometimes I just want to relax.',
        },
        {
          tutor: () => 'Same here. A good movie night sounds perfect.',
          user: () => 'Absolutely, that sounds great.',
        },
      ],
    },
    {
      id: 'advanced',
      label: 'Advanced',
      conversation: [
        {
          tutor: (studentName) =>
            `Good morning ${studentName}! How’s your day going so far?`,
          user: () =>
            'I went for a walk this morning — it was so nice out.',
        },
        {
          tutor: () => 'That sounds lovely! Do you often go for walks?',
          user: () => 'Yes, it helps me clear my mind before work.',
        },
        {
          tutor: () => 'That’s a great habit. How’s work going lately?',
          user: () => 'Pretty good, but a bit stressful this week.',
        },
        {
          tutor: () => 'I can imagine. Everyone’s busy before the holidays!',
          user: () => 'Exactly. I’m looking forward to some rest.',
        },
      ],
    },
  ] as const,
};



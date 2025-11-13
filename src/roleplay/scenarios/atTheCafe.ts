import {RolePlayScenarioConfig} from '../types';

export const atTheCafeScenario: RolePlayScenarioConfig = {
  id: 'atTheCafe',
  title: 'At the Café',
  introEn:
    'You’re at a café in London. You’re ordering a coffee and maybe a snack.',
  introIt:
    'Sei in un bar a Londra. Stai ordinando un caffè e forse uno snack.',
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      conversation: [
        {
          tutor: (studentName) =>
            `Hello ${studentName}! What would you like to order today?`,
          user: () => 'Can I have a coffee, please?',
        },
        {
          tutor: () => 'Sure! Would you like milk or sugar?',
          user: () => 'A cappuccino, please.',
        },
        {
          tutor: () => 'For here or to go?',
          user: () => 'To go, please.',
        },
        {
          tutor: () => 'Okay! Anything to eat?',
          user: () => 'A croissant, please.',
        },
        {
          tutor: () => 'Great choice!',
          user: () => 'Thank you!',
        },
      ],
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      conversation: [
        {
          tutor: (studentName) =>
            `Good morning ${studentName}! What kind of coffee would you like today?`,
          user: () => 'Could I get a cappuccino with oat milk, please?',
        },
        {
          tutor: () =>
            'Of course! Would you like any flavour, like vanilla or caramel?',
          user: () => 'No, thanks. Just the coffee.',
        },
        {
          tutor: () => 'Alright! Anything to eat?',
          user: () => 'Maybe a sandwich — what do you recommend?',
        },
        {
          tutor: () => 'The mozzarella and tomato one is really popular.',
          user: () => 'That sounds good. I’ll take that.',
        },
      ],
    },
    {
      id: 'advanced',
      label: 'Advanced',
      conversation: [
        {
          tutor: (studentName) =>
            `Hi there ${studentName}, welcome! What can I get you today?`,
          user: () => 'Hi! Can I get a flat white and a croissant, please?',
        },
        {
          tutor: () => 'Sure! For here or to go?',
          user: () => 'For here, thanks. Could you warm up the croissant?',
        },
        {
          tutor: () => 'Of course! Would you like anything else?',
          user: () => 'No, that’s all. How’s your day going?',
        },
        {
          tutor: () => 'Pretty good! It’s been busy this morning.',
          user: () => 'Hope it slows down later!',
        },
      ],
    },
  ] as const,
};



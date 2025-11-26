import {RolePlayScenarioConfig, Round} from '../types';

const beginnerRounds: Round[] = [
  {
    id: 1,
    title: 'General Interaction',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What would you like? What can I get you? Here is a possible answer: 'I'd like a coffee, please.' Now please tell me what you would like.`,
        exampleAnswer: "I'd like a coffee, please.",
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `For here or to go? Here is a possible answer: 'For here, please.' Now please tell me if it's for here or to go.`,
        exampleAnswer: 'For here, please.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Do you need anything else? Here is a possible answer: 'No, thank you.' Now please tell me if you need anything else.`,
        exampleAnswer: 'No, thank you.',
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Small Talk',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Are you from here? Here is a possible answer: 'No, I'm not from here.' Now please tell me if you are from here.`,
        exampleAnswer: "No, I'm not from here.",
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Do you come here often? Here is a possible answer: 'Yes, I come sometimes.' Now please tell me if you come here often.`,
        exampleAnswer: 'Yes, I come sometimes.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Are you working or relaxing? Here is a possible answer: 'I'm relaxing.' Now please tell me if you are working or relaxing.`,
        exampleAnswer: "I'm relaxing.",
      },
    ],
  },
  {
    id: 3,
    title: 'Handling Problems & Requests',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Sorry, the Wi-Fi is not working. Is that okay? Here is a possible answer: 'It's okay.' Now please tell me if that's okay.`,
        exampleAnswer: "It's okay.",
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `We don't have oat milk. Would you like something else? Here is a possible answer: 'Regular milk is fine.' Now please tell me what you would like instead.`,
        exampleAnswer: 'Regular milk is fine.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `It's crowded. Would you like another table? Here is a possible answer: 'Yes, thank you.' Now please tell me if you would like another table.`,
        exampleAnswer: 'Yes, thank you.',
      },
    ],
  },
];

export const atTheCafeScenario: RolePlayScenarioConfig = {
  id: 'atTheCafe',
  title: 'At the Café',
  introEn:
    "You're at a café in London. You're ordering a coffee and maybe a snack.",
  introIt:
    'Sei in un bar a Londra. Stai ordinando un caffè e forse uno snack.',
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Hello ${studentName}! Welcome to the café.`,
        rounds: beginnerRounds,
      },
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Good morning ${studentName}! Welcome to the café.`,
        firstQuestion: (studentName: string) =>
          `What would you like? What can I get you?`,
        rounds: [
          {
            id: 1,
            title: 'General Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `What would you like? What can I get you? Here is a possible answer: 'I'd like a cappuccino, please. And could I have a croissant as well?' Now please tell me what you would like.`,
                exampleAnswer: "I'd like a cappuccino, please. And could I have a croissant as well?",
        },
        {
                letter: 'B',
                question: (studentName: string) =>
                  `For here or to go? Here is a possible answer: 'For here, please. I want to sit for a bit and relax.' Now please tell me if it's for here or to go.`,
                exampleAnswer: 'For here, please. I want to sit for a bit and relax.',
        },
        {
                letter: 'C',
                question: (studentName: string) =>
                  `Do you need anything else? Here is a possible answer: 'No, thank you. That's all for now.' Now please tell me if you need anything else.`,
                exampleAnswer: "No, thank you. That's all for now.",
              },
            ],
          },
          {
            id: 2,
            title: 'Social & Small Talk',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Are you from around here? Here is a possible answer: 'No, I'm not from here, but I moved nearby recently. I like this neighbourhood.' Now please tell me if you are from around here.`,
                exampleAnswer: "No, I'm not from here, but I moved nearby recently. I like this neighbourhood.",
        },
        {
                letter: 'B',
                question: (studentName: string) =>
                  `Do you come here often? Here is a possible answer: 'Yes, I come here a few times a week. The café is really nice and comfortable.' Now please tell me if you come here often.`,
                exampleAnswer: 'Yes, I come here a few times a week. The café is really nice and comfortable.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Are you working or just relaxing today? Here is a possible answer: 'I'm working a little, but I'm also taking a break.' Now please tell me if you are working or just relaxing today.`,
                exampleAnswer: "I'm working a little, but I'm also taking a break.",
        },
      ],
    },
    {
            id: 3,
            title: 'Solving Problems & Special Requests',
            questions: [
        {
                letter: 'A',
                question: (studentName: string) =>
                  `Sorry, the Wi-Fi isn't working right now. Is that okay? Here is a possible answer: 'That's okay. I can use my mobile data for now.' Now please tell me if that's okay.`,
                exampleAnswer: "That's okay. I can use my mobile data for now.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `We're out of oat milk. Would you like something else? Here is a possible answer: 'No problem. Regular milk is fine.' Now please tell me what you would like instead.`,
                exampleAnswer: 'No problem. Regular milk is fine.',
        },
        {
                letter: 'C',
                question: (studentName: string) =>
                  `It's getting crowded. Would you like to move to another table? Here is a possible answer: 'Sure, that's okay. Thank you.' Now please tell me if you would like to move to another table.`,
                exampleAnswer: "Sure, that's okay. Thank you.",
              },
            ],
          },
        ],
      },
    },
    {
      id: 'advanced',
      label: 'Advanced',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Good morning ${studentName}! Welcome to the café.`,
        firstQuestion: (studentName: string) =>
          `What would you like? What can I get you?`,
        rounds: [
          {
            id: 1,
            title: 'General Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `What would you like? What can I get you? Here is a possible answer: 'Thanks, I'll have a cappuccino with oat milk, please. If it's possible, I'd also like a slice of your almond cake - I've heard it's excellent.' Now please tell me what you would like.`,
                exampleAnswer: "Thanks, I'll have a cappuccino with oat milk, please. If it's possible, I'd also like a slice of your almond cake - I've heard it's excellent.",
        },
        {
                letter: 'B',
                question: (studentName: string) =>
                  `For here or to go? Here is a possible answer: 'For here. I have some work to finish, and this seems like the perfect place to focus.' Now please tell me if it's for here or to go.`,
                exampleAnswer: 'For here. I have some work to finish, and this seems like the perfect place to focus.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Do you need anything else? Here is a possible answer: 'Not for now, thank you. But if you don't mind, could you let me know when the Wi-Fi is working again?' Now please tell me if you need anything else.`,
                exampleAnswer: "Not for now, thank you. But if you don't mind, could you let me know when the Wi-Fi is working again?",
        },
      ],
    },
    {
            id: 2,
            title: 'Social & Small Talk',
            questions: [
        {
                letter: 'A',
                question: (studentName: string) =>
                  `Are you from around here? Here is a possible answer: 'Not originally, but I've been living in this area for a couple of years. I love the energy here. It's lively without being overwhelming.' Now please tell me if you are from around here.`,
                exampleAnswer: "Not originally, but I've been living in this area for a couple of years. I love the energy here. It's lively without being overwhelming.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Do you come here often? Here is a possible answer: 'Quite often, actually. I enjoy the atmosphere - it's friendly, calm, and great for getting work done.' Now please tell me if you come here often.`,
                exampleAnswer: "Quite often, actually. I enjoy the atmosphere - it's friendly, calm, and great for getting work done.",
        },
        {
                letter: 'C',
                question: (studentName: string) =>
                  `Are you working or just relaxing today? Here is a possible answer: 'A bit of both. I'm finishing a few tasks, but I'm also trying to enjoy a slower morning.' Now please tell me if you are working or just relaxing today.`,
                exampleAnswer: "A bit of both. I'm finishing a few tasks, but I'm also trying to enjoy a slower morning.",
              },
            ],
          },
          {
            id: 3,
            title: 'Solving Problems & Requests',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Sorry, the Wi-Fi isn't working at the moment. Is that okay? Here is a possible answer: 'No problem at all. I can work offline or use my hotspot for a while - just let me know when it's back.' Now please tell me if that's okay.`,
                exampleAnswer: "No problem at all. I can work offline or use my hotspot for a while - just let me know when it's back.",
        },
        {
                letter: 'B',
                question: (studentName: string) =>
                  `We're out of oat milk. Would you like something else? We have whole or skim milk. Here is a possible answer: 'That's totally fine. I'll take whole milk instead - thanks for letting me know.' Now please tell me what you would like instead.`,
                exampleAnswer: "That's totally fine. I'll take whole milk instead - thanks for letting me know.",
        },
        {
                letter: 'C',
                question: (studentName: string) =>
                  `It is getting crowded here. Would you like to move to another table? Here is a possible answer: 'If there's another spot available, that would be great. Thank you for offering.' Now please tell me if you would like to move to another table.`,
                exampleAnswer: "If there's another spot available, that would be great. Thank you for offering.",
        },
      ],
          },
        ],
      },
    },
  ] as const,
};



import {RolePlayScenarioConfig, Round} from '../types';

const beginnerRounds: Round[] = [
  {
    id: 1,
    title: 'General Interaction',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `How's your day going? Here is a possible answer: 'It's going well, thanks. A little busy, but not too bad.' Now please tell me how your day is going.`,
        exampleAnswer: "It's going well, thanks. A little busy, but not too bad.",
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Is this your first time here? Here is a possible answer: 'Yes, it is. I wanted to try this place today.' Now please tell me if this is your first time here.`,
        exampleAnswer: 'Yes, it is. I wanted to try this place today.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Are you having a good week so far? Here is a possible answer: 'Yes, so far it's been good. Just a little busy.' Now please tell me how your week is going.`,
        exampleAnswer: "Yes, so far it's been good. Just a little busy.",
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
          `What do you usually do on weekends? Here is a possible answer: 'I usually relax, meet friends, or watch something at home.' Now please tell me what you usually do on weekends.`,
        exampleAnswer: 'I usually relax, meet friends, or watch something at home.',
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Have you seen any good movies or shows lately? Here is a possible answer: 'Yes, I watched a nice movie last week. I really liked it.' Now please tell me about movies or shows you've seen.`,
        exampleAnswer: 'Yes, I watched a nice movie last week. I really liked it.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Do you have any plans for later today? Here is a possible answer: 'Nothing big. I might go for a walk or see a friend.' Now please tell me about your plans for later today.`,
        exampleAnswer: 'Nothing big. I might go for a walk or see a friend.',
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
          `Sorry, am I interrupting? Here is a possible answer: 'No, it's okay. I'm not very busy.' Now please tell me if I'm interrupting.`,
        exampleAnswer: "No, it's okay. I'm not very busy.",
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `I'm not sure… have we met before? Here is a possible answer: 'Maybe! I think we met once, but I'm not sure.' Now please tell me if we've met before.`,
        exampleAnswer: "Maybe! I think we met once, but I'm not sure.",
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Am I keeping you? Do you need to go? Here is a possible answer: 'No worries, I have a few minutes. It's fine.' Now please tell me if I'm keeping you.`,
        exampleAnswer: "No worries, I have a few minutes. It's fine.",
      },
    ],
  },
];

export const dailySmallTalkScenario: RolePlayScenarioConfig = {
  id: 'dailySmallTalk',
  title: 'Daily Small Talk',
  introEn:
    "You're chatting with a colleague or a friendly neighbour. Keep it casual and friendly.",
  introIt:
    'Stai chiacchierando con un collega o un vicino. Mantieni un tono semplice e amichevole.',
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Hi ${studentName}! How are you today?`,
        firstQuestion: (studentName: string) =>
          `How's your day going?`,
        rounds: beginnerRounds,
      },
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Hey ${studentName}! How are you today?`,
        firstQuestion: (studentName: string) =>
          `How's your day going?`,
        rounds: [
          {
            id: 1,
            title: 'General Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `How's your day going? Here is a possible answer: 'It's going well, thanks. A bit busy, but not too bad.' Now please tell me how your day is going.`,
                exampleAnswer: "It's going well, thanks. A bit busy, but not too bad.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Is this your first time here? Here is a possible answer: 'Yes, it is. I wanted to try this place.' Now please tell me if this is your first time here.`,
                exampleAnswer: 'Yes, it is. I wanted to try this place.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Are you having a good week so far? Here is a possible answer: 'Yes, so far it's been good. Just a little busy.' Now please tell me how your week is going.`,
                exampleAnswer: "Yes, so far it's been good. Just a little busy.",
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
                  `What do you usually do on weekends? Here is a possible answer: 'I usually relax, meet some friends, or watch something at home.' Now please tell me what you usually do on weekends.`,
                exampleAnswer: 'I usually relax, meet some friends, or watch something at home.',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Have you seen any good movies or shows lately? Here is a possible answer: 'Yes, I watched a nice movie last week. I really enjoyed it.' Now please tell me about movies or shows you've seen.`,
                exampleAnswer: 'Yes, I watched a nice movie last week. I really enjoyed it.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Do you have any plans for later today? Here is a possible answer: 'Nothing big. I might go for a walk or meet a friend.' Now please tell me about your plans for later today.`,
                exampleAnswer: 'Nothing big. I might go for a walk or meet a friend.',
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
                  `Sorry, am I interrupting? Here is a possible answer: 'No, it's okay. I'm not too busy.' Now please tell me if I'm interrupting.`,
                exampleAnswer: "No, it's okay. I'm not too busy.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `I'm not sure… have we met before? Here is a possible answer: 'Maybe! I think we met once, but I'm not sure either.' Now please tell me if we've met before.`,
                exampleAnswer: "Maybe! I think we met once, but I'm not sure either.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Am I keeping you? Do you need to go? Here is a possible answer: 'No worries, I have a few minutes. It's fine.' Now please tell me if I'm keeping you.`,
                exampleAnswer: "No worries, I have a few minutes. It's fine.",
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
          `Hey ${studentName}! How are you today?`,
        firstQuestion: (studentName: string) =>
          `How's your day going?`,
        rounds: [
          {
            id: 1,
            title: 'General Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `How's your day going? Here is a possible answer: 'Pretty well, thanks. It's busy, but I'm managing.' Now please tell me how your day is going.`,
                exampleAnswer: "Pretty well, thanks. It's busy, but I'm managing.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Is this your first time here? Here is a possible answer: 'Yes, it is. I've heard good things, so I thought I'd stop by and check it out.' Now please tell me if this is your first time here.`,
                exampleAnswer: "Yes, it is. I've heard good things, so I thought I'd stop by and check it out.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Are you having a good week so far? Here is a possible answer: 'Yes, it's been good so far—busy, but good.' Now please tell me how your week is going.`,
                exampleAnswer: "Yes, it's been good so far—busy, but good.",
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
                  `What do you usually do on weekends? Here is a possible answer: 'I usually try to relax, spend time with friends, and catch up on things I didn't finish during the week.' Now please tell me what you usually do on weekends.`,
                exampleAnswer: "I usually try to relax, spend time with friends, and catch up on things I didn't finish during the week.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Have you seen any good movies or shows lately? Here is a possible answer: 'Yes, actually. I watched a great series last week—really well written and surprisingly funny.' Now please tell me about movies or shows you've seen.`,
                exampleAnswer: 'Yes, actually. I watched a great series last week—really well written and surprisingly funny.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Do you have any plans for today after this? Here is a possible answer: 'Nothing special. I might go for a walk or grab a coffee with a friend if they're free.' Now please tell me about your plans for today after this.`,
                exampleAnswer: "Nothing special. I might go for a walk or grab a coffee with a friend if they're free.",
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
                  `Sorry, may I ask you something—am I interrupting anything? Here is a possible answer: 'Not at all. I'm just finishing something, but I can take a break.' Now please tell me if I'm interrupting anything.`,
                exampleAnswer: "Not at all. I'm just finishing something, but I can take a break.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `I'm terrible with names… have we met before? Here is a possible answer: 'Don't worry, it happens to everyone. Yes, we met briefly last month at a charity event.' Now please tell me if we've met before.`,
                exampleAnswer: "Don't worry, it happens to everyone. Yes, we met briefly last month at a charity event.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `I hope I'm not keeping you — were you leaving? Here is a possible answer: 'I have a few minutes left, no problem. But thank you for asking.' Now please tell me if I'm keeping you.`,
                exampleAnswer: "I have a few minutes left, no problem. But thank you for asking.",
              },
            ],
          },
        ],
      },
    },
  ] as const,
};



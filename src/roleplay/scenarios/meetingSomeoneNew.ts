import {RolePlayScenarioConfig, Round} from '../types';

const beginnerRounds: Round[] = [
  {
    id: 1,
    title: 'General Interaction',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Nice to meet you. What's your name? Here is a possible answer: 'Nice to meet you too. I'm Alex.' Now please tell me your name.`,
        exampleAnswer: "Nice to meet you too. I'm Alex.",
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Where are you from? Here is a possible answer: 'I'm from Florence, but I live here now.' Now please tell me where you are from.`,
        exampleAnswer: "I'm from Florence, but I live here now.",
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Is this your first time at this event? Here is a possible answer: 'Yes, it is. It looks very nice.' Now please tell me if this is your first time at this event.`,
        exampleAnswer: 'Yes, it is. It looks very nice.',
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Friendly Interaction',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What do you do for work? Here is a possible answer: 'I work in marketing. I help with online content.' Now please tell me what you do for work.`,
        exampleAnswer: 'I work in marketing. I help with online content.',
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `How do you know the host? Here is a possible answer: 'We met through a friend some time ago.' Now please tell me how you know the host.`,
        exampleAnswer: 'We met through a friend some time ago.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What do you like doing in your free time? Here is a possible answer: 'I like reading, walking, and meeting friends.' Now please tell me what you like doing in your free time.`,
        exampleAnswer: 'I like reading, walking, and meeting friends.',
      },
    ],
  },
  {
    id: 3,
    title: 'Handling Challenging Situations',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Can I ask why you came here today? Here is a possible answer: 'Sure. I wanted to meet new people and see the event.' Now please tell me why you came here today.`,
        exampleAnswer: 'Sure. I wanted to meet new people and see the event.',
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Sorry, I didn't catch your name. Can you say it again? Here is a possible answer: 'Of course! It's Alex.' Now please tell me your name again.`,
        exampleAnswer: "Of course! It's Alex.",
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Would you like to stay in touch? Here is a possible answer: 'Yes, that would be nice. I can give you my number or Instagram.' Now please tell me if you would like to stay in touch.`,
        exampleAnswer: 'Yes, that would be nice. I can give you my number or Instagram.',
      },
    ],
  },
];

export const meetingSomeoneNewScenario: RolePlayScenarioConfig = {
  id: 'meetingSomeoneNew',
  title: 'Meeting Someone New',
  introEn:
    "You've just met someone at an event. You're introducing yourself and asking about them.",
  introIt:
    'Hai appena conosciuto qualcuno a un evento. Ti presenti e fai domande per conoscerlo meglio.',
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Hi there! Nice to meet you.`,
        firstQuestion: (studentName: string) =>
          `Nice to meet you. What's your name?`,
        rounds: beginnerRounds,
      },
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Hi there! Nice to meet you.`,
        firstQuestion: (studentName: string) =>
          `Nice to meet you. What's your name?`,
        rounds: [
          {
            id: 1,
            title: 'General Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Nice to meet you. What's your name? Here is a possible answer: 'Nice to meet you too. I'm Alex.' Now please tell me your name.`,
                exampleAnswer: "Nice to meet you too. I'm Alex.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Where are you from? Here is a possible answer: 'I'm from Florence, but I live here now.' Now please tell me where you are from.`,
                exampleAnswer: "I'm from Florence, but I live here now.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Is this your first time at this event? Here is a possible answer: 'Yes, it is. Everything looks really nice.' Now please tell me if this is your first time at this event.`,
                exampleAnswer: 'Yes, it is. Everything looks really nice.',
              },
            ],
          },
          {
            id: 2,
            title: 'Social & Friendly Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `What do you do for work? Here is a possible answer: 'I work in marketing. I help with online content and communication.' Now please tell me what you do for work.`,
                exampleAnswer: 'I work in marketing. I help with online content and communication.',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `How do you know the host? Here is a possible answer: 'We met through a friend some time ago.' Now please tell me how you know the host.`,
                exampleAnswer: 'We met through a friend some time ago.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `What do you like doing in your free time? Here is a possible answer: 'I like reading, going for walks, and meeting friends.' Now please tell me what you like doing in your free time.`,
                exampleAnswer: 'I like reading, going for walks, and meeting friends.',
              },
            ],
          },
          {
            id: 3,
            title: 'Handling Challenging Situations',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Can I ask what brought you here today? Here is a possible answer: 'Sure. I wanted to meet new people and see what this event is like.' Now please tell me what brought you here today.`,
                exampleAnswer: 'Sure. I wanted to meet new people and see what this event is like.',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Sorry, I didn't catch your name. Could you say it again? Here is a possible answer: 'Of course! It's Alex.' Now please tell me your name again.`,
                exampleAnswer: "Of course! It's Alex.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Would you like to stay in touch? Here is a possible answer: 'Yes, that would be nice. I can give you my number or Instagram.' Now please tell me if you would like to stay in touch.`,
                exampleAnswer: 'Yes, that would be nice. I can give you my number or Instagram.',
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
          `Hi there! Nice to meet you.`,
        firstQuestion: (studentName: string) =>
          `Nice to meet you. What's your name?`,
        rounds: [
          {
            id: 1,
            title: 'General Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Nice to meet you. What's your name? Here is a possible answer: 'Nice to meet you too. I'm Alex.' Now please tell me your name.`,
                exampleAnswer: "Nice to meet you too. I'm Alex.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Where are you from? Here is a possible answer: 'I'm from Florence, but I've been living here for a few years.' Now please tell me where you are from.`,
                exampleAnswer: "I'm from Florence, but I've been living here for a few years.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Is this your first time at this event? Here is a possible answer: 'Yes, it is. I wasn't sure what to expect, but it seems really nice.' Now please tell me if this is your first time at this event.`,
                exampleAnswer: "Yes, it is. I wasn't sure what to expect, but it seems really nice.",
              },
            ],
          },
          {
            id: 2,
            title: 'Social & Friendly Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `What do you do for work? Here is a possible answer: 'I work in marketing. I focus mostly on digital communication and strategy.' Now please tell me what you do for work.`,
                exampleAnswer: 'I work in marketing. I focus mostly on digital communication and strategy.',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `How do you know the host/organizer? Here is a possible answer: 'We met through a mutual friend a couple of years ago.' Now please tell me how you know the host/organizer.`,
                exampleAnswer: 'We met through a mutual friend a couple of years ago.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `What do you usually enjoy doing in your free time? Here is a possible answer: 'I like reading, going to exhibitions, and walking around the city.' Now please tell me what you usually enjoy doing in your free time.`,
                exampleAnswer: 'I like reading, going to exhibitions, and walking around the city.',
              },
            ],
          },
          {
            id: 3,
            title: 'Handling More Complex or Subtle Interaction',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `I hope I'm not asking too much — can I ask what brought you here today? Here is a possible answer: 'Not at all. I came because I'm interested in meeting new people and learning more about the community.' Now please tell me what brought you here today.`,
                exampleAnswer: "Not at all. I came because I'm interested in meeting new people and learning more about the community.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `I'm sorry, I didn't catch your name earlier. Could you repeat it? Here is a possible answer: 'Of course — it's Alex. Don't worry, it happens all the time.' Now please tell me your name again.`,
                exampleAnswer: "Of course — it's Alex. Don't worry, it happens all the time.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Would you like to stay in touch? Here is a possible answer: 'Yes, absolutely. Let me give you my number or Instagram — whichever you prefer.' Now please tell me if you would like to stay in touch.`,
                exampleAnswer: 'Yes, absolutely. Let me give you my number or Instagram — whichever you prefer.',
              },
            ],
          },
        ],
      },
    },
  ] as const,
};



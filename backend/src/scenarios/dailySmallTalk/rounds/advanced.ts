/**
 * Rounds para Daily Small Talk - Advanced Level
 */

import {RoundConfig} from '../../../prompts/types';

export const dailySmallTalkAdvancedRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Interaction',
    description: 'Advanced everyday conversation starters',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `How's your day going? Here is a possible answer: 'Pretty well, thanks. It's busy, but I'm managing.' Now please tell me how your day is going.`,
        exampleAnswer: "Pretty well, thanks. It's busy, but I'm managing.",
        difficulty: 'hard',
        expectedTopics: ['daily life', 'feelings', 'polite responses'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Is this your first time here? Here is a possible answer: 'Yes, it is. I've heard good things, so I thought I'd stop by and check it out.' Now please tell me if this is your first time here.`,
        exampleAnswer: "Yes, it is. I've heard good things, so I thought I'd stop by and check it out.",
        difficulty: 'hard',
        expectedTopics: ['first time', 'location', 'intentions'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Are you having a good week so far? Here is a possible answer: 'Yes, it's been good so far—busy, but good.' Now please tell me how your week is going.`,
        exampleAnswer: "Yes, it's been good so far—busy, but good.",
        difficulty: 'hard',
        expectedTopics: ['week', 'progress', 'feelings'],
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Small Talk',
    description: 'Advanced casual social conversation topics',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What do you usually do on weekends? Here is a possible answer: 'I usually try to relax, spend time with friends, and catch up on things I didn't finish during the week.' Now please tell me what you usually do on weekends.`,
        exampleAnswer: "I usually try to relax, spend time with friends, and catch up on things I didn't finish during the week.",
        difficulty: 'hard',
        expectedTopics: ['weekends', 'activities', 'habits'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Have you seen any good movies or shows lately? Here is a possible answer: 'Yes, actually. I watched a great series last week—really well written and surprisingly funny.' Now please tell me about movies or shows you've seen.`,
        exampleAnswer: 'Yes, actually. I watched a great series last week—really well written and surprisingly funny.',
        difficulty: 'hard',
        expectedTopics: ['entertainment', 'movies', 'shows'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Do you have any plans for today after this? Here is a possible answer: 'Nothing special. I might go for a walk or grab a coffee with a friend if they're free.' Now please tell me about your plans for today after this.`,
        exampleAnswer: "Nothing special. I might go for a walk or grab a coffee with a friend if they're free.",
        difficulty: 'hard',
        expectedTopics: ['plans', 'future', 'activities'],
      },
    ],
  },
  {
    id: 3,
    title: 'Handling Problems & Requests',
    description: 'Advanced dealing with interruptions and social situations',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Sorry, may I ask you something—am I interrupting anything? Here is a possible answer: 'Not at all. I'm just finishing something, but I can take a break.' Now please tell me if I'm interrupting anything.`,
        exampleAnswer: "Not at all. I'm just finishing something, but I can take a break.",
        difficulty: 'hard',
        expectedTopics: ['interruptions', 'politeness', 'reassurance'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `I'm terrible with names… have we met before? Here is a possible answer: 'Don't worry, it happens to everyone. Yes, we met briefly last month at a charity event.' Now please tell me if we've met before.`,
        exampleAnswer: "Don't worry, it happens to everyone. Yes, we met briefly last month at a charity event.",
        difficulty: 'hard',
        expectedTopics: ['recognition', 'uncertainty', 'memory'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `I hope I'm not keeping you — were you leaving? Here is a possible answer: 'I have a few minutes left, no problem. But thank you for asking.' Now please tell me if I'm keeping you.`,
        exampleAnswer: "I have a few minutes left, no problem. But thank you for asking.",
        difficulty: 'hard',
        expectedTopics: ['time', 'politeness', 'reassurance'],
      },
    ],
  },
];


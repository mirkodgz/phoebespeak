/**
 * Rounds para Daily Small Talk - Beginner Level
 */

import {RoundConfig} from '../../../prompts/types';

export const dailySmallTalkBeginnerRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Interaction',
    description: 'Basic everyday conversation starters',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `How's your day going? Here is a possible answer: 'It's going well, thanks. A little busy, but not too bad.' Now please tell me how your day is going.`,
        exampleAnswer: "It's going well, thanks. A little busy, but not too bad.",
        difficulty: 'easy',
        expectedTopics: ['daily life', 'feelings', 'polite responses'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Is this your first time here? Here is a possible answer: 'Yes, it is. I wanted to try this place today.' Now please tell me if this is your first time here.`,
        exampleAnswer: 'Yes, it is. I wanted to try this place today.',
        difficulty: 'easy',
        expectedTopics: ['first time', 'location', 'intentions'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Are you having a good week so far? Here is a possible answer: 'Yes, so far it's been good. Just a little busy.' Now please tell me how your week is going.`,
        exampleAnswer: "Yes, so far it's been good. Just a little busy.",
        difficulty: 'easy',
        expectedTopics: ['week', 'progress', 'feelings'],
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Small Talk',
    description: 'Casual social conversation topics',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What do you usually do on weekends? Here is a possible answer: 'I usually relax, meet friends, or watch something at home.' Now please tell me what you usually do on weekends.`,
        exampleAnswer: 'I usually relax, meet friends, or watch something at home.',
        difficulty: 'easy',
        expectedTopics: ['weekends', 'activities', 'habits'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Have you seen any good movies or shows lately? Here is a possible answer: 'Yes, I watched a nice movie last week. I really liked it.' Now please tell me about movies or shows you've seen.`,
        exampleAnswer: 'Yes, I watched a nice movie last week. I really liked it.',
        difficulty: 'easy',
        expectedTopics: ['entertainment', 'movies', 'shows'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Do you have any plans for later today? Here is a possible answer: 'Nothing big. I might go for a walk or see a friend.' Now please tell me about your plans for later today.`,
        exampleAnswer: 'Nothing big. I might go for a walk or see a friend.',
        difficulty: 'easy',
        expectedTopics: ['plans', 'future', 'activities'],
      },
    ],
  },
  {
    id: 3,
    title: 'Handling Problems & Requests',
    description: 'Dealing with interruptions and social situations',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Sorry, am I interrupting? Here is a possible answer: 'No, it's okay. I'm not very busy.' Now please tell me if I'm interrupting.`,
        exampleAnswer: "No, it's okay. I'm not very busy.",
        difficulty: 'easy',
        expectedTopics: ['interruptions', 'politeness', 'reassurance'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `I'm not sure… have we met before? Here is a possible answer: 'Maybe! I think we met once, but I'm not sure.' Now please tell me if we've met before.`,
        exampleAnswer: "Maybe! I think we met once, but I'm not sure.",
        difficulty: 'easy',
        expectedTopics: ['recognition', 'uncertainty', 'memory'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Am I keeping you? Do you need to go? Here is a possible answer: 'No worries, I have a few minutes. It's fine.' Now please tell me if I'm keeping you.`,
        exampleAnswer: "No worries, I have a few minutes. It's fine.",
        difficulty: 'easy',
        expectedTopics: ['time', 'politeness', 'reassurance'],
      },
    ],
  },
];


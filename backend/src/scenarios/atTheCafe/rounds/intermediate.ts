/**
 * Rounds para At The Café - Intermediate Level
 */

import {RoundConfig} from '../../../prompts/types';

export const atTheCafeIntermediateRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Interaction',
    description: 'Basic ordering and interaction at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What would you like? What can I get you? Here is a possible answer: 'I'd like a cappuccino, please. And could I have a croissant as well?' Now please tell me what you would like.`,
        exampleAnswer: "I'd like a cappuccino, please. And could I have a croissant as well?",
        difficulty: 'medium',
        expectedTopics: ['ordering', 'requests', 'polite expressions'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `For here or to go? Here is a possible answer: 'For here, please. I want to sit for a bit and relax.' Now please tell me if it's for here or to go.`,
        exampleAnswer: 'For here, please. I want to sit for a bit and relax.',
        difficulty: 'medium',
        expectedTopics: ['preferences', 'location', 'polite responses'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Do you need anything else? Here is a possible answer: 'No, thank you. That's all for now.' Now please tell me if you need anything else.`,
        exampleAnswer: "No, thank you. That's all for now.",
        difficulty: 'medium',
        expectedTopics: ['politeness', 'declining', 'gratitude'],
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Small Talk',
    description: 'Casual conversation while at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Are you from around here? Here is a possible answer: 'No, I'm not from here, but I moved nearby recently. I like this neighbourhood.' Now please tell me if you are from around here.`,
        exampleAnswer: "No, I'm not from here, but I moved nearby recently. I like this neighbourhood.",
        difficulty: 'medium',
        expectedTopics: ['origin', 'location', 'personal information'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Do you come here often? Here is a possible answer: 'Yes, I come here a few times a week. The café is really nice and comfortable.' Now please tell me if you come here often.`,
        exampleAnswer: 'Yes, I come here a few times a week. The café is really nice and comfortable.',
        difficulty: 'medium',
        expectedTopics: ['frequency', 'habits', 'social interaction'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Are you working or just relaxing today? Here is a possible answer: 'I'm working a little, but I'm also taking a break.' Now please tell me if you are working or just relaxing today.`,
        exampleAnswer: "I'm working a little, but I'm also taking a break.",
        difficulty: 'medium',
        expectedTopics: ['activities', 'state', 'leisure'],
      },
    ],
  },
  {
    id: 3,
    title: 'Solving Problems & Special Requests',
    description: 'Dealing with issues and special requests at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Sorry, the Wi-Fi isn't working right now. Is that okay? Here is a possible answer: 'That's okay. I can use my mobile data for now.' Now please tell me if that's okay.`,
        exampleAnswer: "That's okay. I can use my mobile data for now.",
        difficulty: 'medium',
        expectedTopics: ['understanding', 'acceptance', 'reassurance'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `We're out of oat milk. Would you like something else? Here is a possible answer: 'No problem. Regular milk is fine.' Now please tell me what you would like instead.`,
        exampleAnswer: 'No problem. Regular milk is fine.',
        difficulty: 'medium',
        expectedTopics: ['alternatives', 'flexibility', 'preferences'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `It's getting crowded. Would you like to move to another table? Here is a possible answer: 'Sure, that's okay. Thank you.' Now please tell me if you would like to move to another table.`,
        exampleAnswer: "Sure, that's okay. Thank you.",
        difficulty: 'medium',
        expectedTopics: ['accepting offers', 'gratitude', 'preferences'],
      },
    ],
  },
];


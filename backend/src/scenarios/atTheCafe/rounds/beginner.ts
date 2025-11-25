/**
 * Rounds para At The Café - Beginner Level
 */

import {RoundConfig} from '../../../prompts/types';

export const atTheCafeBeginnerRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Interaction',
    description: 'Basic ordering and interaction at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What would you like? What can I get you? Here is a possible answer: 'I'd like a coffee, please.' Now please tell me what you would like.`,
        exampleAnswer: "I'd like a coffee, please.",
        difficulty: 'easy',
        expectedTopics: ['ordering', 'requests', 'polite expressions'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `For here or to go? Here is a possible answer: 'For here, please.' Now please tell me if it's for here or to go.`,
        exampleAnswer: 'For here, please.',
        difficulty: 'easy',
        expectedTopics: ['preferences', 'location', 'polite responses'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Do you need anything else? Here is a possible answer: 'No, thank you.' Now please tell me if you need anything else.`,
        exampleAnswer: 'No, thank you.',
        difficulty: 'easy',
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
          `Are you from here? Here is a possible answer: 'No, I'm not from here.' Now please tell me if you are from here.`,
        exampleAnswer: "No, I'm not from here.",
        difficulty: 'easy',
        expectedTopics: ['origin', 'location', 'personal information'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Do you come here often? Here is a possible answer: 'Yes, I come sometimes.' Now please tell me if you come here often.`,
        exampleAnswer: 'Yes, I come sometimes.',
        difficulty: 'easy',
        expectedTopics: ['frequency', 'habits', 'social interaction'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Are you working or relaxing? Here is a possible answer: 'I'm relaxing.' Now please tell me if you are working or relaxing.`,
        exampleAnswer: "I'm relaxing.",
        difficulty: 'easy',
        expectedTopics: ['activities', 'state', 'leisure'],
      },
    ],
  },
  {
    id: 3,
    title: 'Handling Problems & Requests',
    description: 'Dealing with issues and special requests at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Sorry, the Wi-Fi is not working. Is that okay? Here is a possible answer: 'It's okay.' Now please tell me if that's okay.`,
        exampleAnswer: "It's okay.",
        difficulty: 'easy',
        expectedTopics: ['understanding', 'acceptance', 'reassurance'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `We don't have oat milk. Would you like something else? Here is a possible answer: 'Regular milk is fine.' Now please tell me what you would like instead.`,
        exampleAnswer: 'Regular milk is fine.',
        difficulty: 'easy',
        expectedTopics: ['alternatives', 'flexibility', 'preferences'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `It's crowded. Would you like another table? Here is a possible answer: 'Yes, thank you.' Now please tell me if you would like another table.`,
        exampleAnswer: 'Yes, thank you.',
        difficulty: 'easy',
        expectedTopics: ['accepting offers', 'gratitude', 'preferences'],
      },
    ],
  },
];


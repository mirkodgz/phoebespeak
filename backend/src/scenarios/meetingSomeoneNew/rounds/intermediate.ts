/**
 * Rounds para Meeting Someone New - Intermediate Level
 */

import {RoundConfig} from '../../../prompts/types';

export const meetingSomeoneNewIntermediateRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Interaction',
    description: 'Basic introductions and getting to know someone',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Nice to meet you. What's your name? Here is a possible answer: 'Nice to meet you too. I'm Alex.' Now please tell me your name.`,
        exampleAnswer: "Nice to meet you too. I'm Alex.",
        difficulty: 'medium',
        expectedTopics: ['introductions', 'names', 'greetings'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Where are you from? Here is a possible answer: 'I'm from Florence, but I live here now.' Now please tell me where you are from.`,
        exampleAnswer: "I'm from Florence, but I live here now.",
        difficulty: 'medium',
        expectedTopics: ['origin', 'location', 'background'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Is this your first time at this event? Here is a possible answer: 'Yes, it is. Everything looks really nice.' Now please tell me if this is your first time at this event.`,
        exampleAnswer: 'Yes, it is. Everything looks really nice.',
        difficulty: 'medium',
        expectedTopics: ['first time', 'events', 'impressions'],
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Friendly Interaction',
    description: 'Getting to know someone better through friendly conversation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What do you do for work? Here is a possible answer: 'I work in marketing. I help with online content and communication.' Now please tell me what you do for work.`,
        exampleAnswer: 'I work in marketing. I help with online content and communication.',
        difficulty: 'medium',
        expectedTopics: ['work', 'profession', 'career'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `How do you know the host? Here is a possible answer: 'We met through a friend some time ago.' Now please tell me how you know the host.`,
        exampleAnswer: 'We met through a friend some time ago.',
        difficulty: 'medium',
        expectedTopics: ['connections', 'relationships', 'social'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What do you like doing in your free time? Here is a possible answer: 'I like reading, going for walks, and meeting friends.' Now please tell me what you like doing in your free time.`,
        exampleAnswer: 'I like reading, going for walks, and meeting friends.',
        difficulty: 'medium',
        expectedTopics: ['hobbies', 'interests', 'free time'],
      },
    ],
  },
  {
    id: 3,
    title: 'Handling Challenging Situations',
    description: 'Dealing with questions and maintaining conversation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Can I ask what brought you here today? Here is a possible answer: 'Sure. I wanted to meet new people and see what this event is like.' Now please tell me what brought you here today.`,
        exampleAnswer: 'Sure. I wanted to meet new people and see what this event is like.',
        difficulty: 'medium',
        expectedTopics: ['reasons', 'motivations', 'intentions'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Sorry, I didn't catch your name. Could you say it again? Here is a possible answer: 'Of course! It's Alex.' Now please tell me your name again.`,
        exampleAnswer: "Of course! It's Alex.",
        difficulty: 'medium',
        expectedTopics: ['clarification', 'repetition', 'politeness'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Would you like to stay in touch? Here is a possible answer: 'Yes, that would be nice. I can give you my number or Instagram.' Now please tell me if you would like to stay in touch.`,
        exampleAnswer: 'Yes, that would be nice. I can give you my number or Instagram.',
        difficulty: 'medium',
        expectedTopics: ['contact', 'future plans', 'social connections'],
      },
    ],
  },
];


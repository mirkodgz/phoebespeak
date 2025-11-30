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
          `Nice to meet you. What's your name? Here is an answer you can use as a guide. Now why don't you try? 'Nice to meet you too. I'm Alex.' your name.`,
        exampleAnswer: "Nice to meet you too. I'm Alex.",
        difficulty: 'medium',
        expectedTopics: ['introductions', 'names', 'greetings'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Where are you from? Here is an answer you can use as a guide. Now why don't you try? 'I'm from Florence, but I live here now.' where you are from.`,
        exampleAnswer: "I'm from Florence, but I live here now.",
        difficulty: 'medium',
        expectedTopics: ['origin', 'location', 'background'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Is this your first time at this event? Here is an answer you can use as a guide. Now why don't you try? 'Yes, it is. Everything looks really nice.' if this is your first time at this event.`,
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
          `What do you do for work? Here is an answer you can use as a guide. Now why don't you try? 'I work in marketing. I help with online content and communication.' what you do for work.`,
        exampleAnswer: 'I work in marketing. I help with online content and communication.',
        difficulty: 'medium',
        expectedTopics: ['work', 'profession', 'career'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `How do you know the host? Here is an answer you can use as a guide. Now why don't you try? 'We met through a friend some time ago.' how you know the host.`,
        exampleAnswer: 'We met through a friend some time ago.',
        difficulty: 'medium',
        expectedTopics: ['connections', 'relationships', 'social'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What do you like doing in your free time? Here is an answer you can use as a guide. Now why don't you try? 'I like reading, going for walks, and meeting friends.' what you like doing in your free time.`,
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
          `Can I ask what brought you here today? Here is an answer you can use as a guide. Now why don't you try? 'Sure. I wanted to meet new people and see what this event is like.' what brought you here today.`,
        exampleAnswer: 'Sure. I wanted to meet new people and see what this event is like.',
        difficulty: 'medium',
        expectedTopics: ['reasons', 'motivations', 'intentions'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Sorry, I didn't catch your name. Could you say it again? Here is an answer you can use as a guide. Now why don't you try? 'Of course! It's Alex.' your name again.`,
        exampleAnswer: "Of course! It's Alex.",
        difficulty: 'medium',
        expectedTopics: ['clarification', 'repetition', 'politeness'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Would you like to stay in touch? Here is an answer you can use as a guide. Now why don't you try? 'Yes, that would be nice. I can give you my number or Instagram.' if you would like to stay in touch.`,
        exampleAnswer: 'Yes, that would be nice. I can give you my number or Instagram.',
        difficulty: 'medium',
        expectedTopics: ['contact', 'future plans', 'social connections'],
      },
    ],
  },
];


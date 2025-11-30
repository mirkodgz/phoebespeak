/**
 * Rounds para Meeting Someone New - Advanced Level
 */

import {RoundConfig} from '../../../prompts/types';

export const meetingSomeoneNewAdvancedRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Interaction',
    description: 'Advanced introductions and getting to know someone',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Nice to meet you. What's your name? Here is an answer you can use as a guide. Now why don't you try? 'Nice to meet you too. I'm Alex.' your name.`,
        exampleAnswer: "Nice to meet you too. I'm Alex.",
        difficulty: 'hard',
        expectedTopics: ['introductions', 'names', 'greetings'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Where are you from? Here is an answer you can use as a guide. Now why don't you try? 'I'm from Florence, but I've been living here for a few years.' where you are from.`,
        exampleAnswer: "I'm from Florence, but I've been living here for a few years.",
        difficulty: 'hard',
        expectedTopics: ['origin', 'location', 'background'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Is this your first time at this event? Here is an answer you can use as a guide. Now why don't you try? 'Yes, it is. I wasn't sure what to expect, but it seems really nice.' if this is your first time at this event.`,
        exampleAnswer: "Yes, it is. I wasn't sure what to expect, but it seems really nice.",
        difficulty: 'hard',
        expectedTopics: ['first time', 'events', 'impressions'],
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Friendly Interaction',
    description: 'Advanced getting to know someone better through friendly conversation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What do you do for work? Here is an answer you can use as a guide. Now why don't you try? 'I work in marketing. I focus mostly on digital communication and strategy.' what you do for work.`,
        exampleAnswer: 'I work in marketing. I focus mostly on digital communication and strategy.',
        difficulty: 'hard',
        expectedTopics: ['work', 'profession', 'career'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `How do you know the host/organizer? Here is an answer you can use as a guide. Now why don't you try? 'We met through a mutual friend a couple of years ago.' how you know the host/organizer.`,
        exampleAnswer: 'We met through a mutual friend a couple of years ago.',
        difficulty: 'hard',
        expectedTopics: ['connections', 'relationships', 'social'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What do you usually enjoy doing in your free time? Here is an answer you can use as a guide. Now why don't you try? 'I like reading, going to exhibitions, and walking around the city.' what you usually enjoy doing in your free time.`,
        exampleAnswer: 'I like reading, going to exhibitions, and walking around the city.',
        difficulty: 'hard',
        expectedTopics: ['hobbies', 'interests', 'free time'],
      },
    ],
  },
  {
    id: 3,
    title: 'Handling More Complex or Subtle Interaction',
    description: 'Advanced dealing with questions and maintaining conversation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `I hope I'm not asking too much — can I ask what brought you here today? Here is an answer you can use as a guide. Now why don't you try? 'Not at all. I came because I'm interested in meeting new people and learning more about the community.' what brought you here today.`,
        exampleAnswer: "Not at all. I came because I'm interested in meeting new people and learning more about the community.",
        difficulty: 'hard',
        expectedTopics: ['reasons', 'motivations', 'intentions'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `I'm sorry, I didn't catch your name earlier. Could you repeat it? Here is an answer you can use as a guide. Now why don't you try? 'Of course — it's Alex. Don't worry, it happens all the time.' your name again.`,
        exampleAnswer: "Of course — it's Alex. Don't worry, it happens all the time.",
        difficulty: 'hard',
        expectedTopics: ['clarification', 'repetition', 'politeness'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Would you like to stay in touch? Here is an answer you can use as a guide. Now why don't you try? 'Yes, absolutely. Let me give you my number or Instagram — whichever you prefer.' if you would like to stay in touch.`,
        exampleAnswer: 'Yes, absolutely. Let me give you my number or Instagram — whichever you prefer.',
        difficulty: 'hard',
        expectedTopics: ['contact', 'future plans', 'social connections'],
      },
    ],
  },
];


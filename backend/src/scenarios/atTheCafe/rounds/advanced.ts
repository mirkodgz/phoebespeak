/**
 * Rounds para At The Café - Advanced Level
 */

import {RoundConfig} from '../../../prompts/types';

export const atTheCafeAdvancedRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Interaction',
    description: 'Advanced ordering and interaction at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What would you like? What can I get you? Here is an answer you can use as a guide. Now why don't you try? 'Thanks, I'll have a cappuccino with oat milk, please. If it's possible, I'd also like a slice of your almond cake - I've heard it's excellent.' what you would like.`,
        exampleAnswer: "Thanks, I'll have a cappuccino with oat milk, please. If it's possible, I'd also like a slice of your almond cake - I've heard it's excellent.",
        difficulty: 'hard',
        expectedTopics: ['ordering', 'requests', 'polite expressions'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `For here or to go? Here is an answer you can use as a guide. Now why don't you try? 'For here. I have some work to finish, and this seems like the perfect place to focus.' if it's for here or to go.`,
        exampleAnswer: 'For here. I have some work to finish, and this seems like the perfect place to focus.',
        difficulty: 'hard',
        expectedTopics: ['preferences', 'location', 'polite responses'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Do you need anything else? Here is an answer you can use as a guide. Now why don't you try? 'Not for now, thank you. But if you don't mind, could you let me know when the Wi-Fi is working again?' if you need anything else.`,
        exampleAnswer: "Not for now, thank you. But if you don't mind, could you let me know when the Wi-Fi is working again?",
        difficulty: 'hard',
        expectedTopics: ['politeness', 'requests', 'gratitude'],
      },
    ],
  },
  {
    id: 2,
    title: 'Social & Small Talk',
    description: 'Advanced casual conversation while at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Are you from around here? Here is an answer you can use as a guide. Now why don't you try? 'Not originally, but I've been living in this area for a couple of years. I love the energy here. It's lively without being overwhelming.' if you are from around here.`,
        exampleAnswer: "Not originally, but I've been living in this area for a couple of years. I love the energy here. It's lively without being overwhelming.",
        difficulty: 'hard',
        expectedTopics: ['origin', 'location', 'personal information'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Do you come here often? Here is an answer you can use as a guide. Now why don't you try? 'Quite often, actually. I enjoy the atmosphere - it's friendly, calm, and great for getting work done.' if you come here often.`,
        exampleAnswer: "Quite often, actually. I enjoy the atmosphere - it's friendly, calm, and great for getting work done.",
        difficulty: 'hard',
        expectedTopics: ['frequency', 'habits', 'social interaction'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Are you working or just relaxing today? Here is an answer you can use as a guide. Now why don't you try? 'A bit of both. I'm finishing a few tasks, but I'm also trying to enjoy a slower morning.' if you are working or just relaxing today.`,
        exampleAnswer: "A bit of both. I'm finishing a few tasks, but I'm also trying to enjoy a slower morning.",
        difficulty: 'hard',
        expectedTopics: ['activities', 'state', 'leisure'],
      },
    ],
  },
  {
    id: 3,
    title: 'Solving Problems & Requests',
    description: 'Advanced dealing with issues and special requests at the café',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Sorry, the Wi-Fi isn't working at the moment. Is that okay? Here is an answer you can use as a guide. Now why don't you try? 'No problem at all. I can work offline or use my hotspot for a while - just let me know when it's back.' if that's okay.`,
        exampleAnswer: "No problem at all. I can work offline or use my hotspot for a while - just let me know when it's back.",
        difficulty: 'hard',
        expectedTopics: ['understanding', 'acceptance', 'reassurance'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `We're out of oat milk. Would you like something else? We have whole or skim milk. Here is an answer you can use as a guide. Now why don't you try? 'That's totally fine. I'll take whole milk instead - thanks for letting me know.' what you would like instead.`,
        exampleAnswer: "That's totally fine. I'll take whole milk instead - thanks for letting me know.",
        difficulty: 'hard',
        expectedTopics: ['alternatives', 'flexibility', 'preferences'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `It is getting crowded here. Would you like to move to another table? Here is an answer you can use as a guide. Now why don't you try? 'If there's another spot available, that would be great. Thank you for offering.' if you would like to move to another table.`,
        exampleAnswer: "If there's another spot available, that would be great. Thank you for offering.",
        difficulty: 'hard',
        expectedTopics: ['accepting offers', 'gratitude', 'preferences'],
      },
    ],
  },
];


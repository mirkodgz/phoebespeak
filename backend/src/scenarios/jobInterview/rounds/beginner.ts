/**
 * Rounds para Job Interview - Beginner Level
 */

import {RoundConfig} from '../../../prompts/types';

export const jobInterviewBeginnerRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Questions',
    description: 'Basic questions about the candidate\'s background and motivation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Tell me about yourself? Here is an answer you can use as a guide. Now why don't you try? 'I am a hard-working person. I like learning and working with others.'`,
        exampleAnswer:
          'I am a hard-working person. I like learning and working with others.',
        difficulty: 'easy',
        expectedTopics: ['background', 'personality', 'skills'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Why do you want this job? Here is an answer you can use as a guide. Now why don't you try? 'I think this job is good for my skills, and I want to grow.'`,
        exampleAnswer:
          'I think this job is good for my skills, and I want to grow.',
        difficulty: 'easy',
        expectedTopics: ['motivation', 'career goals', 'company fit'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What are your strengths? Here is an answer you can use as a guide. Now why don't you try? 'I am organized, calm, and I finish my work on time.' about your strengths.`,
        exampleAnswer:
          'I am organized, calm, and I finish my work on time.',
        difficulty: 'easy',
        expectedTopics: ['strengths', 'skills', 'abilities'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `What is your weakness? Here is an answer you can use as a guide. Now why don't you try? 'Sometimes I take too many tasks, but I am learning to manage my time better.' about your weakness.`,
        exampleAnswer:
          'Sometimes I take too many tasks, but I am learning to manage my time better.',
        difficulty: 'easy',
        expectedTopics: ['self-awareness', 'improvement', 'growth'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `Where do you see yourself in one year? Here is an answer you can use as a guide. Now why don't you try? 'I want to be more confident and take more responsibility.' where you see yourself in one year.`,
        exampleAnswer:
          'I want to be more confident and take more responsibility.',
        difficulty: 'easy',
        expectedTopics: ['future plans', 'career goals', 'aspirations'],
      },
    ],
  },
  {
    id: 2,
    title: 'Behavioral & Problem-Solving',
    description: 'Questions about past experiences and problem-solving abilities',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Tell me about a problem you solved at work? Here is an answer you can use as a guide. Now why don't you try? 'Two colleagues had a misunderstanding. I listened and helped them understand each other.' about a problem you solved at work.`,
        exampleAnswer:
          'Two colleagues had a misunderstanding. I listened and helped them understand each other.',
        difficulty: 'easy',
        expectedTopics: ['problem-solving', 'conflict resolution', 'teamwork'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `How do you work in a team? Here is an answer you can use as a guide. Now why don't you try? 'I listen, I share ideas, and I stay respectful.' how you work in a team.`,
        exampleAnswer:
          'I listen, I share ideas, and I stay respectful.',
        difficulty: 'easy',
        expectedTopics: ['teamwork', 'collaboration', 'communication'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Tell me about a time you worked under pressure? Here is an answer you can use as a guide. Now why don't you try? 'I had many tasks. I organized them and finished everything on time.' about a time you worked under pressure.`,
        exampleAnswer:
          'I had many tasks. I organized them and finished everything on time.',
        difficulty: 'easy',
        expectedTopics: ['stress management', 'time management', 'resilience'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `A client is unhappy. What do you do? Here is an answer you can use as a guide. Now why don't you try? 'I listen, explain the solution clearly, and try to help while following company rules.' what you would do if a client is unhappy.`,
        exampleAnswer:
          'I listen, explain the solution clearly, and try to help while following company rules.',
        difficulty: 'easy',
        expectedTopics: ['customer service', 'conflict resolution', 'professionalism'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `How do you handle changes at work? Here is an answer you can use as a guide. Now why don't you try? 'I stay flexible, ask questions, and learn the new process.' how you handle changes at work.`,
        exampleAnswer:
          'I stay flexible, ask questions, and learn the new process.',
        difficulty: 'easy',
        expectedTopics: ['adaptability', 'flexibility', 'change management'],
      },
    ],
  },
  {
    id: 3,
    title: 'Salary, Bonuses, Vacation',
    description: 'Questions about compensation and benefits expectations',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What was your salary in your last job? Here is an answer you can use as a guide. Now why don't you try? 'I prefer to focus on this job. What is the salary range for this role?' Now please answer this question.`,
        exampleAnswer:
          'I prefer to focus on this job. What is the salary range for this role?',
        difficulty: 'easy',
        expectedTopics: ['salary negotiation', 'professionalism', 'tact'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `What salary are you expecting? Here is an answer you can use as a guide. Now why don't you try? 'I want a fair salary for the responsibilities. What is the range you offer?' what salary you are expecting.`,
        exampleAnswer:
          'I want a fair salary for the responsibilities. What is the range you offer?',
        difficulty: 'easy',
        expectedTopics: ['salary expectations', 'negotiation', 'professionalism'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `How do bonuses fit into your expectations? Here is an answer you can use as a guide. Now why don't you try? 'I am open to bonuses. I would like to know how they work here.' about bonuses.`,
        exampleAnswer:
          'I am open to bonuses. I would like to know how they work here.',
        difficulty: 'easy',
        expectedTopics: ['compensation', 'benefits', 'bonuses'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `What are your vacation expectations? Here is an answer you can use as a guide. Now why don't you try? 'I follow the company policy. I just need clear information.' about your vacation expectations.`,
        exampleAnswer:
          'I follow the company policy. I just need clear information.',
        difficulty: 'easy',
        expectedTopics: ['vacation', 'work-life balance', 'benefits'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `Why should we choose you? Here is an answer you can use as a guide. Now why don't you try? 'I work hard, I am reliable, and I care about doing a good job.' why we should choose you.`,
        exampleAnswer:
          'I work hard, I am reliable, and I care about doing a good job.',
        difficulty: 'easy',
        expectedTopics: ['self-promotion', 'value proposition', 'closing'],
      },
    ],
  },
];


/**
 * Rounds para Job Interview - Intermediate Level
 */

import {RoundConfig} from '../../../prompts/types';

export const jobInterviewIntermediateRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Questions',
    description: 'Basic questions about the candidate\'s background and motivation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Tell me about yourself? Here is a possible answer: 'I am a motivated person, and I like learning new skills. I work well with others, and I always try to be proactive. I enjoy contributing to projects and helping the team move forward.' Now please tell me about yourself.`,
        exampleAnswer:
          'I am a motivated person, and I like learning new skills. I work well with others, and I always try to be proactive. I enjoy contributing to projects and helping the team move forward.',
        difficulty: 'medium',
        expectedTopics: ['background', 'personality', 'skills'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Why do you want this job? Here is a possible answer: 'I find this job matches my skills, and I believe I can grow while also contributing to the company.' Now please tell me why you want this job.`,
        exampleAnswer:
          'I find this job matches my skills, and I believe I can grow while also contributing to the company.',
        difficulty: 'medium',
        expectedTopics: ['motivation', 'career goals', 'company fit'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What are your strengths? Here is a possible answer: 'My main strengths are communication skills and being responsible. I stay calm under pressure, I listen before taking action, and I complete my work on time. I can also help support the team when needed.' Now please tell me about your strengths.`,
        exampleAnswer:
          'My main strengths are communication skills and being responsible. I stay calm under pressure, I listen before taking action, and I complete my work on time. I can also help support the team when needed.',
        difficulty: 'medium',
        expectedTopics: ['strengths', 'skills', 'abilities'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `What is your main weakness? Here is a possible answer: 'I sometimes say yes to too many tasks because I like helping others, but I'm learning to manage my time and delegate more effectively.' Now please tell me about your main weakness.`,
        exampleAnswer:
          "I sometimes say yes to too many tasks because I like helping others, but I'm learning to manage my time and delegate more effectively.",
        difficulty: 'medium',
        expectedTopics: ['self-awareness', 'improvement', 'growth'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `Where do you see yourself in one year? Here is a possible answer: 'In one year, I hope to be more confident in my role, understand the company well, and take on more responsibilities.' Now please tell me where you see yourself in one year.`,
        exampleAnswer:
          'In one year, I hope to be more confident in my role, understand the company well, and take on more responsibilities.',
        difficulty: 'medium',
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
          `Tell me about a problem you solved at work? Here is a possible answer: 'There was a misunderstanding between two colleagues. I listened to both sides, explained the information clearly, and helped the team work together and move forward.' Now please tell me about a problem you solved at work.`,
        exampleAnswer:
          'There was a misunderstanding between two colleagues. I listened to both sides, explained the information clearly, and helped the team work together and move forward.',
        difficulty: 'medium',
        expectedTopics: ['problem-solving', 'conflict resolution', 'teamwork'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `How do you work with a team? Here is a possible answer: 'I share ideas, listen to others, and stay respectful. When there is a disagreement, I try to understand the reasons and help find a solution. I let colleagues know when I am available so they can reach out if they need something.' Now please tell me how you work with a team.`,
        exampleAnswer:
          'I share ideas, listen to others, and stay respectful. When there is a disagreement, I try to understand the reasons and help find a solution. I let colleagues know when I am available so they can reach out if they need something.',
        difficulty: 'medium',
        expectedTopics: ['teamwork', 'collaboration', 'communication'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Tell me about a time you worked under pressure? Here is a possible answer: 'I had many tasks to complete before an important deadline. I organized my work, asked questions when needed, and completed everything on time. I am good at managing stressful situations.' Now please tell me about a time you worked under pressure.`,
        exampleAnswer:
          'I had many tasks to complete before an important deadline. I organized my work, asked questions when needed, and completed everything on time. I am good at managing stressful situations.',
        difficulty: 'medium',
        expectedTopics: ['stress management', 'time management', 'resilience'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `A client is unhappy. What do you do? Here is a possible answer: 'I listen to the client, show that I understand the problem, and explain clearly what we can do. I try to keep the client satisfied while respecting company rules.' Now please tell me what you would do if a client is unhappy.`,
        exampleAnswer:
          'I listen to the client, show that I understand the problem, and explain clearly what we can do. I try to keep the client satisfied while respecting company rules.',
        difficulty: 'medium',
        expectedTopics: ['customer service', 'conflict resolution', 'professionalism'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `How do you handle changes at work? Here is a possible answer: 'I try to stay flexible. I ask questions, learn the new process, and keep a positive attitude. I focus on my tasks and try not to worry about things I cannot control.' Now please tell me how you handle changes at work.`,
        exampleAnswer:
          'I try to stay flexible. I ask questions, learn the new process, and keep a positive attitude. I focus on my tasks and try not to worry about things I cannot control.',
        difficulty: 'medium',
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
          `What was your salary in your last job? Here is a possible answer: 'I prefer to focus on this position rather than my past salary. Could you tell me the salary range for this role?' Now please answer this question.`,
        exampleAnswer:
          'I prefer to focus on this position rather than my past salary. Could you tell me the salary range for this role?',
        difficulty: 'medium',
        expectedTopics: ['salary negotiation', 'professionalism', 'tact'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `What salary are you expecting? Here is a possible answer: 'I am looking for a fair salary based on the responsibilities of the role. Could you share the range your company offers for this position?' Now please tell me what salary you are expecting.`,
        exampleAnswer:
          'I am looking for a fair salary based on the responsibilities of the role. Could you share the range your company offers for this position?',
        difficulty: 'medium',
        expectedTopics: ['salary expectations', 'negotiation', 'professionalism'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `How do bonuses fit into your overall compensation expectations? Here is a possible answer: 'I am open to discussing bonuses. I would like to know how your company gives bonuses and how they work here.' Now please tell me about bonuses.`,
        exampleAnswer:
          'I am open to discussing bonuses. I would like to know how your company gives bonuses and how they work here.',
        difficulty: 'medium',
        expectedTopics: ['compensation', 'benefits', 'bonuses'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `What are your expectations in terms of vacation? Here is a possible answer: 'I am open to the company policy. I simply appreciate clarity about the company's vacation policy.' Now please tell me about your vacation expectations.`,
        exampleAnswer:
          "I am open to the company policy. I simply appreciate clarity about the company's vacation policy.",
        difficulty: 'medium',
        expectedTopics: ['vacation', 'work-life balance', 'benefits'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `Why should we choose you? Here is a possible answer: 'I believe I am an ideal candidate because I am hard-working, organized and I care about the quality of my work. I am a reliable person and I am eager to grow.' Now please tell me why we should choose you.`,
        exampleAnswer:
          'I believe I am an ideal candidate because I am hard-working, organized and I care about the quality of my work. I am a reliable person and I am eager to grow.',
        difficulty: 'medium',
        expectedTopics: ['self-promotion', 'value proposition', 'closing'],
      },
    ],
  },
];


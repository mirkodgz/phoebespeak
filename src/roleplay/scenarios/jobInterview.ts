import {RolePlayScenarioConfig} from '../types';

export const jobInterviewScenario: RolePlayScenarioConfig = {
  id: 'jobInterview',
  title: 'Job Interview',
  introEn:
    'You’re having a job interview for an international company. Let’s see how you present yourself.',
  introIt:
    'Stai facendo un colloquio di lavoro per un’azienda internazionale. Vediamo come ti presenti.',
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      conversation: [
        {
          tutor: (studentName) => `Welcome, ${studentName}! What is your name?`,
          user: (studentName) =>
            `My name is ${studentName}. I am from Italy. I like working with people.`,
        },
        {
          tutor: () => `That’s great! What kind of job are you looking for?`,
          user: () => 'In marketing or communication.',
        },
        {
          tutor: () => `Good! Why do you want to work here?`,
          user: () => 'Because I like this company.',
        },
        {
          tutor: () => `Nice answer! What are your strengths?`,
          user: () => 'I am friendly and hard-working.',
        },
      ],
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      conversation: [
        {
          tutor: (studentName) =>
            `Welcome back, ${studentName}! How many years have you been working?`,
          user: () =>
            `I’ve been working in sales for three years and I’m ready for a new challenge.`,
        },
        {
          tutor: () => `Nice! Can you tell me about a project you enjoyed?`,
          user: () =>
            `Yes, I helped create a new campaign that increased sales.`,
        },
        {
          tutor: () => `Excellent! What did you learn from that experience?`,
          user: () => `I learned how to work better in a team.`,
        },
        {
          tutor: () => `Good! And what do you expect from your next job?`,
          user: () =>
            `I’d like to learn new skills and grow professionally.`,
        },
      ],
    },
    {
      id: 'advanced',
      label: 'Advanced',
      conversation: [
        {
          tutor: (studentName) =>
            `Welcome, ${studentName}! What was your last job?`,
          user: () =>
            `I worked in marketing for a few years, and now I’d like to grow in a new role.`,
        },
        {
          tutor: () => `Sounds good! What skills would you bring to the team?`,
          user: () =>
            `I’m very organized and I communicate well under pressure.`,
        },
        {
          tutor: () => `That’s great. How do you handle challenges at work?`,
          user: () =>
            `I stay calm, analyze the situation, and find a solution.`,
        },
        {
          tutor: () => `Excellent approach. What motivates you the most?`,
          user: () =>
            `Helping teams succeed and seeing the impact of my work motivates me the most.`,
        },
      ],
    },
  ] as const,
};



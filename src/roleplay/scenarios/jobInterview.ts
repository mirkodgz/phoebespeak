import {RolePlayScenarioConfig} from '../types';

export const jobInterviewScenario: RolePlayScenarioConfig = {
  id: 'jobInterview',
  title: 'Job Interview',
  introEn:
    "You're having a job interview for an international company. Let's see how you present yourself.",
  introIt:
    "Stai facendo un colloquio di lavoro per un'azienda internazionale. Vediamo come ti presenti.",
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Hello, ${studentName}. Nice to see you today.`,
        firstQuestion: (studentName: string) =>
          `Tell me about yourself. Here is a simple example answer: 'I am a motivated person, and I like learning new skills. I work well with others, and I always try to be proactive. I enjoy contributing to projects and helping the team move forward.' Now please tell me about yourself.`,
        followUpQuestions: [
          (studentName: string) =>
            `Why do you want this job? Here is a possible answer: 'I find this job matches my skills, and I believe I can grow while also contributing to the company.' Now please tell me why you want this job.`,
          (studentName: string) =>
            `What are your strengths? Here is a possible answer: 'My main strengths are communication skills and being responsible. I stay calm under pressure, I listen before I act, and I complete my work on time. I can also help support the team when needed.' Now please tell me about your strengths.`,
          (studentName: string) =>
            `What is your main weakness? Here is a possible answer: 'I sometimes say yes to too many tasks because I like helping others, but I'm learning to manage my time and delegate more effectively.' Now please tell me about your main weakness.`,
          (studentName: string) =>
            `Where do you see yourself in one year? Here is a possible answer: 'In one year, I hope to be more confident in my role, understand the company well, and take on more responsibilities.' Now please tell me where you see yourself in one year.`,
        ],
        maxTurns: 6,
      },
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



import {RolePlayScenarioConfig, Round} from '../types';

const beginnerRounds: Round[] = [
  {
    id: 1,
    title: 'General Questions',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Tell me about yourself? Here is an answer you can use as a guide. Now why don't you try? 'I am a hard-working person. I like learning and working with others.'`,
        exampleAnswer:
          'I am a hard-working person. I like learning and working with others.',
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Why do you want this job? Here is an answer you can use as a guide. Now why don't you try? 'I think this job is good for my skills, and I want to grow.' Now please tell me why you want this job.`,
        exampleAnswer:
          'I think this job is good for my skills, and I want to grow.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What are your strengths? Here is an answer you can use as a guide. Now why don't you try? 'I am organized, calm, and I finish my work on time.' Now please tell me about your strengths.`,
        exampleAnswer:
          'I am organized, calm, and I finish my work on time.',
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `What is your weakness? Here is an answer you can use as a guide. Now why don't you try? 'Sometimes I take too many tasks, but I am learning to manage my time better.' Now please tell me about your weakness.`,
        exampleAnswer:
          'Sometimes I take too many tasks, but I am learning to manage my time better.',
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `Where do you see yourself in one year? Here is an answer you can use as a guide. Now why don't you try? 'I want to be more confident and take more responsibility.' Now please tell me where you see yourself in one year.`,
        exampleAnswer:
          'I want to be more confident and take more responsibility.',
      },
    ],
  },
  {
    id: 2,
    title: 'Behavioral & Problem-Solving',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Tell me about a problem you solved at work? Here is an answer you can use as a guide. Now why don't you try? 'Two colleagues had a misunderstanding. I listened and helped them understand each other.' Now please tell me about a problem you solved at work.`,
        exampleAnswer:
          'Two colleagues had a misunderstanding. I listened and helped them understand each other.',
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `How do you work in a team? Here is an answer you can use as a guide. Now why don't you try? 'I listen, I share ideas, and I stay respectful.' Now please tell me how you work in a team.`,
        exampleAnswer:
          'I listen, I share ideas, and I stay respectful.',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Tell me about a time you worked under pressure? Here is an answer you can use as a guide. Now why don't you try? 'I had many tasks. I organized them and finished everything on time.' Now please tell me about a time you worked under pressure.`,
        exampleAnswer:
          'I had many tasks. I organized them and finished everything on time.',
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `A client is unhappy. What do you do? Here is an answer you can use as a guide. Now why don't you try? 'I listen, explain the solution clearly, and try to help while following company rules.' Now please tell me what you would do if a client is unhappy.`,
        exampleAnswer:
          'I listen, explain the solution clearly, and try to help while following company rules.',
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `How do you handle changes at work? Here is an answer you can use as a guide. Now why don't you try? 'I stay flexible, ask questions, and learn the new process.' Now please tell me how you handle changes at work.`,
        exampleAnswer:
          'I stay flexible, ask questions, and learn the new process.',
      },
    ],
  },
  {
    id: 3,
    title: 'Salary, Bonuses, Vacation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What was your salary in your last job? Here is an answer you can use as a guide. Now why don't you try? 'I prefer to focus on this job. What is the salary range for this role?' Now please answer this question.`,
        exampleAnswer:
          'I prefer to focus on this job. What is the salary range for this role?',
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `What salary are you expecting? Here is an answer you can use as a guide. Now why don't you try? 'I want a fair salary for the responsibilities. What is the range you offer?' Now please tell me what salary you are expecting.`,
        exampleAnswer:
          'I want a fair salary for the responsibilities. What is the range you offer?',
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `How do bonuses fit into your expectations? Here is an answer you can use as a guide. Now why don't you try? 'I am open to bonuses. I would like to know how they work here.' Now please tell me about bonuses.`,
        exampleAnswer:
          'I am open to bonuses. I would like to know how they work here.',
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `What are your vacation expectations? Here is an answer you can use as a guide. Now why don't you try? 'I follow the company policy. I just need clear information.' Now please tell me about your vacation expectations.`,
        exampleAnswer:
          'I follow the company policy. I just need clear information.',
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `Why should we choose you? Here is an answer you can use as a guide. Now why don't you try? 'I work hard, I am reliable, and I care about doing a good job.' Now please tell me why we should choose you.`,
        exampleAnswer:
          'I work hard, I am reliable, and I care about doing a good job.',
      },
    ],
  },
];

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
        rounds: beginnerRounds,
      },
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Welcome back, ${studentName}! Nice to see you again.`,
        firstQuestion: (studentName: string) =>
          `Tell me about yourself?`,
        rounds: [
        {
            id: 1,
            title: 'General Questions',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Tell me about yourself? Here is an answer you can use as a guide. Now why don't you try? 'I am a motivated person, and I like learning new skills. I work well with others, and I always try to be proactive. I enjoy contributing to projects and helping the team move forward.' Now please tell me about yourself.`,
                exampleAnswer:
                  'I am a motivated person, and I like learning new skills. I work well with others, and I always try to be proactive. I enjoy contributing to projects and helping the team move forward.',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Why do you want this job? Here is an answer you can use as a guide. Now why don't you try? 'I find this job matches my skills, and I believe I can grow while also contributing to the company.' Now please tell me why you want this job.`,
                exampleAnswer:
                  'I find this job matches my skills, and I believe I can grow while also contributing to the company.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `What are your strengths? Here is an answer you can use as a guide. Now why don't you try? 'My main strengths are communication skills and being responsible. I stay calm under pressure, I listen before taking action, and I complete my work on time. I can also help support the team when needed.' Now please tell me about your strengths.`,
                exampleAnswer:
                  'My main strengths are communication skills and being responsible. I stay calm under pressure, I listen before taking action, and I complete my work on time. I can also help support the team when needed.',
              },
              {
                letter: 'D',
                question: (studentName: string) =>
                  `What is your main weakness? Here is an answer you can use as a guide. Now why don't you try? 'I sometimes say yes to too many tasks because I like helping others, but I'm learning to manage my time and delegate more effectively.' Now please tell me about your main weakness.`,
                exampleAnswer:
                  "I sometimes say yes to too many tasks because I like helping others, but I'm learning to manage my time and delegate more effectively.",
        },
        {
                letter: 'E',
                question: (studentName: string) =>
                  `Where do you see yourself in one year? Here is an answer you can use as a guide. Now why don't you try? 'In one year, I hope to be more confident in my role, understand the company well, and take on more responsibilities.' Now please tell me where you see yourself in one year.`,
                exampleAnswer:
                  'In one year, I hope to be more confident in my role, understand the company well, and take on more responsibilities.',
              },
            ],
          },
          {
            id: 2,
            title: 'Behavioral & Problem-Solving',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Tell me about a problem you solved at work? Here is an answer you can use as a guide. Now why don't you try? 'There was a misunderstanding between two colleagues. I listened to both sides, explained the information clearly, and helped the team work together and move forward.' Now please tell me about a problem you solved at work.`,
                exampleAnswer:
                  'There was a misunderstanding between two colleagues. I listened to both sides, explained the information clearly, and helped the team work together and move forward.',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `How do you work with a team? Here is an answer you can use as a guide. Now why don't you try? 'I share ideas, listen to others, and stay respectful. When there is a disagreement, I try to understand the reasons and help find a solution. I let colleagues know when I am available so they can reach out if they need something.' Now please tell me how you work with a team.`,
                exampleAnswer:
                  'I share ideas, listen to others, and stay respectful. When there is a disagreement, I try to understand the reasons and help find a solution. I let colleagues know when I am available so they can reach out if they need something.',
        },
        {
                letter: 'C',
                question: (studentName: string) =>
                  `Tell me about a time you worked under pressure? Here is an answer you can use as a guide. Now why don't you try? 'I had many tasks to complete before an important deadline. I organized my work, asked questions when needed, and completed everything on time. I am good at managing stressful situations.' Now please tell me about a time you worked under pressure.`,
                exampleAnswer:
                  'I had many tasks to complete before an important deadline. I organized my work, asked questions when needed, and completed everything on time. I am good at managing stressful situations.',
              },
              {
                letter: 'D',
                question: (studentName: string) =>
                  `A client is unhappy. What do you do? Here is an answer you can use as a guide. Now why don't you try? 'I listen to the client, show that I understand the problem, and explain clearly what we can do. I try to keep the client satisfied while respecting company rules.' Now please tell me what you would do if a client is unhappy.`,
                exampleAnswer:
                  'I listen to the client, show that I understand the problem, and explain clearly what we can do. I try to keep the client satisfied while respecting company rules.',
              },
              {
                letter: 'E',
                question: (studentName: string) =>
                  `How do you handle changes at work? Here is an answer you can use as a guide. Now why don't you try? 'I try to stay flexible. I ask questions, learn the new process, and keep a positive attitude. I focus on my tasks and try not to worry about things I cannot control.' Now please tell me how you handle changes at work.`,
                exampleAnswer:
                  'I try to stay flexible. I ask questions, learn the new process, and keep a positive attitude. I focus on my tasks and try not to worry about things I cannot control.',
              },
            ],
        },
        {
            id: 3,
            title: 'Salary, Bonuses, Vacation',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `What was your salary in your last job? Here is an answer you can use as a guide. Now why don't you try? 'I prefer to focus on this position rather than my past salary. Could you tell me the salary range for this role?' Now please answer this question.`,
                exampleAnswer:
                  'I prefer to focus on this position rather than my past salary. Could you tell me the salary range for this role?',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `What salary are you expecting? Here is an answer you can use as a guide. Now why don't you try? 'I am looking for a fair salary based on the responsibilities of the role. Could you share the range your company offers for this position?' Now please tell me what salary you are expecting.`,
                exampleAnswer:
                  'I am looking for a fair salary based on the responsibilities of the role. Could you share the range your company offers for this position?',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `How do bonuses fit into your overall compensation expectations? Here is an answer you can use as a guide. Now why don't you try? 'I am open to discussing bonuses. I would like to know how your company gives bonuses and how they work here.' Now please tell me about bonuses.`,
                exampleAnswer:
                  'I am open to discussing bonuses. I would like to know how your company gives bonuses and how they work here.',
              },
              {
                letter: 'D',
                question: (studentName: string) =>
                  `What are your expectations in terms of vacation? Here is an answer you can use as a guide. Now why don't you try? 'I am open to the company policy. I simply appreciate clarity about the company's vacation policy.' Now please tell me about your vacation expectations.`,
                exampleAnswer:
                  "I am open to the company policy. I simply appreciate clarity about the company's vacation policy.",
              },
              {
                letter: 'E',
                question: (studentName: string) =>
                  `Why should we choose you? Here is an answer you can use as a guide. Now why don't you try? 'I believe I am an ideal candidate because I am hard-working, organized and I care about the quality of my work. I am a reliable person and I am eager to grow.' Now please tell me why we should choose you.`,
                exampleAnswer:
                  'I believe I am an ideal candidate because I am hard-working, organized and I care about the quality of my work. I am a reliable person and I am eager to grow.',
        },
      ],
          },
        ],
      },
    },
    {
      id: 'advanced',
      label: 'Advanced',
      flowConfig: {
        mode: 'dynamic',
        initialGreeting: (studentName: string) =>
          `Welcome, ${studentName}! Nice to see you today.`,
        firstQuestion: (studentName: string) =>
          `Tell me about yourself.`,
        rounds: [
        {
            id: 1,
            title: 'General Questions',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Tell me about yourself. Here is an answer you can use as a guide. Now why don't you try? 'I have seven years of experience in corporate operations, with a focus on streamlining processes and improving cross-team communication. I enjoy solving operational bottlenecks and creating systems that help teams work more efficiently. In my last role, I moved into a more strategic position where I could contribute to long-term planning and company-wide initiatives.' Now please tell me about yourself.`,
                exampleAnswer:
                  'I have seven years of experience in corporate operations, with a focus on streamlining processes and improving cross-team communication. I enjoy solving operational bottlenecks and creating systems that help teams work more efficiently. In my last role, I moved into a more strategic position where I could contribute to long-term planning and company-wide initiatives.',
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Why do you want this job? Here is an answer you can use as a guide. Now why don't you try? 'I'm drawn to your emphasis on sustainable growth and your investment in employee development. The part that resonates with me is how you balance innovation with responsible governance. I was impressed by your recent expansion strategy, which reinforces your long-term vision.' Now please tell me why you want this job.`,
                exampleAnswer:
                  "I'm drawn to your emphasis on sustainable growth and your investment in employee development. The part that resonates with me is how you balance innovation with responsible governance. I was impressed by your recent expansion strategy, which reinforces your long-term vision.",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `What are your strengths? Here is an answer you can use as a guide. Now why don't you try? 'My strongest assets are structured thinking and diplomatic communication. I'm able to bring clarity to complex situations and keep stakeholders aligned, even when priorities shift.' Now please tell me about your strengths.`,
                exampleAnswer:
                  "My strongest assets are structured thinking and diplomatic communication. I'm able to bring clarity to complex situations and keep stakeholders aligned, even when priorities shift.",
        },
        {
                letter: 'D',
                question: (studentName: string) =>
                  `What is one weakness? Here is an answer you can use as a guide. Now why don't you try? 'I used to take on too many commitments at once. I've learned to prioritize more rigorously and to set clearer boundaries. As a result, the quality of my output is consistently high without last-minute pressure.' Now please tell me about one weakness.`,
                exampleAnswer:
                  "I used to take on too many commitments at once. I've learned to prioritize more rigorously and to set clearer boundaries. As a result, the quality of my output is consistently high without last-minute pressure.",
              },
              {
                letter: 'E',
                question: (studentName: string) =>
                  `Describe your ideal working environment. Here is an answer you can use as a guide. Now why don't you try? 'I thrive in environments that value accountability, open communication, and clear goals. I help keep the atmosphere constructive by being transparent, reliable, and proactive.' Now please describe your ideal working environment.`,
                exampleAnswer:
                  'I thrive in environments that value accountability, open communication, and clear goals. I help keep the atmosphere constructive by being transparent, reliable, and proactive.',
              },
              {
                letter: 'F',
                question: (studentName: string) =>
                  `Tell me about a time you worked under pressure. Here is an answer you can use as a guide. Now why don't you try? 'We had a last-minute client request that required rapid coordination. I created a quick escalation plan, delegated tasks based on strengths, and kept communication tight. We delivered on time, and I learned the value of staying calm and structured.' Now please tell me about a time you worked under pressure.`,
                exampleAnswer:
                  'We had a last-minute client request that required rapid coordination. I created a quick escalation plan, delegated tasks based on strengths, and kept communication tight. We delivered on time, and I learned the value of staying calm and structured.',
              },
            ],
        },
        {
            id: 2,
            title: 'Behavioral & Problem-Solving',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `Tell me about a time you influenced a decision without having direct authority. Here is an answer you can use as a guide. Now why don't you try? 'I focused first on understanding the stakeholders' concerns. Once I acknowledged their priorities, I reframed my proposal to show how it aligned with their goals. This created trust and shifted the discussion from positions to shared outcomes.' Now please tell me about a time you influenced a decision without having direct authority.`,
                exampleAnswer:
                  "I focused first on understanding the stakeholders' concerns. Once I acknowledged their priorities, I reframed my proposal to show how it aligned with their goals. This created trust and shifted the discussion from positions to shared outcomes.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `Describe a situation where the team was divided. What did you do? Here is an answer you can use as a guide. Now why don't you try? 'I brought everyone together for a focused conversation, clarified what was fact versus assumption, and identified the shared goal. Once the common objective was visible, disagreements became much easier to reconcile.' Now please describe a situation where the team was divided and what you did.`,
                exampleAnswer:
                  'I brought everyone together for a focused conversation, clarified what was fact versus assumption, and identified the shared goal. Once the common objective was visible, disagreements became much easier to reconcile.',
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `Tell me about a project where the scope suddenly changed. Here is an answer you can use as a guide. Now why don't you try? 'I documented the impact of the new requirements, including risks and trade-offs, and then scheduled a quick decision call. Presenting structured scenarios helped leadership choose a realistic plan.' Now please tell me about a project where the scope suddenly changed.`,
                exampleAnswer:
                  'I documented the impact of the new requirements, including risks and trade-offs, and then scheduled a quick decision call. Presenting structured scenarios helped leadership choose a realistic plan.',
              },
              {
                letter: 'D',
                question: (studentName: string) =>
                  `Describe a time you had limited information but had to decide quickly. Here is an answer you can use as a guide. Now why don't you try? 'I identified what was absolutely essential, gathered the fastest reliable data available, and acted based on probability rather than perfection. Then I communicated early that adjustments might be needed.' Now please describe a time you had limited information but had to decide quickly.`,
                exampleAnswer:
                  'I identified what was absolutely essential, gathered the fastest reliable data available, and acted based on probability rather than perfection. Then I communicated early that adjustments might be needed.',
              },
              {
                letter: 'E',
                question: (studentName: string) =>
                  `How do you handle someone who consistently resists change? Here is an answer you can use as a guide. Now why don't you try? 'I try to understand the underlying fear—loss of control, increased workload, lack of clarity. Once you address the real concern, resistance decreases. If needed, I set clear expectations and timelines.' Now please tell me how you handle someone who consistently resists change.`,
                exampleAnswer:
                  'I try to understand the underlying fear—loss of control, increased workload, lack of clarity. Once you address the real concern, resistance decreases. If needed, I set clear expectations and timelines.',
              },
            ],
        },
        {
            id: 3,
            title: 'Salary, Bonuses, Vacation',
            questions: [
              {
                letter: 'A',
                question: (studentName: string) =>
                  `What was your salary in your last job? Here is an answer you can use as a guide. Now why don't you try? 'I prefer to focus on the responsibilities and expectations of this role. I'm sure your compensation range is aligned with the market, so I would love to understand how you've structured the range for this position.' Now please answer this question.`,
                exampleAnswer:
                  "I prefer to focus on the responsibilities and expectations of this role. I'm sure your compensation range is aligned with the market, so I would love to understand how you've structured the range for this position.",
              },
              {
                letter: 'B',
                question: (studentName: string) =>
                  `What salary are you expecting? Here is an answer you can use as a guide. Now why don't you try? 'Based on my experience and the industry benchmarks, I'm looking for a competitive package. Could you share the range you've budgeted for the role so I can position myself accurately?' Now please tell me what salary you are expecting.`,
                exampleAnswer:
                  "Based on my experience and the industry benchmarks, I'm looking for a competitive package. Could you share the range you've budgeted for the role so I can position myself accurately?",
              },
              {
                letter: 'C',
                question: (studentName: string) =>
                  `We need a number. What is your minimum? Here is an answer you can use as a guide. Now why don't you try? 'I'd like to understand the full compensation package (base salary, bonuses, benefits, vacation, and growth opportunities) before giving a figure, because each company structures compensation differently.' Now please answer this question.`,
                exampleAnswer:
                  "I'd like to understand the full compensation package (base salary, bonuses, benefits, vacation, and growth opportunities) before giving a figure, because each company structures compensation differently.",
              },
              {
                letter: 'D',
                question: (studentName: string) =>
                  `How do bonuses fit into your overall compensation expectations? Here is an answer you can use as a guide. Now why don't you try? 'I value bonuses that are tied to clear, measurable objectives. They reinforce alignment between personal performance and company results.' Now please tell me about bonuses.`,
                exampleAnswer:
                  'I value bonuses that are tied to clear, measurable objectives. They reinforce alignment between personal performance and company results.',
              },
              {
                letter: 'E',
                question: (studentName: string) =>
                  `What are your expectations in terms of vacation? Here is an answer you can use as a guide. Now why don't you try? 'I believe time off is essential for long-term productivity and well-being. I'm flexible, but I do value a policy that allows for proper work-life balance.' Now please tell me about your vacation expectations.`,
                exampleAnswer:
                  "I believe time off is essential for long-term productivity and well-being. I'm flexible, but I do value a policy that allows for proper work-life balance.",
        },
      ],
          },
        ],
      },
    },
  ] as const,
};

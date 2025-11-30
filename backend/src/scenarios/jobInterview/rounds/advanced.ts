/**
 * Rounds para Job Interview - Advanced Level
 */

import {RoundConfig} from '../../../prompts/types';

export const jobInterviewAdvancedRounds: RoundConfig[] = [
  {
    id: 1,
    title: 'General Questions',
    description: 'Advanced questions about the candidate\'s background and motivation',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Tell me about yourself. Here is an answer you can use as a guide. Now why don't you try? 'I have seven years of experience in corporate operations, with a focus on streamlining processes and improving cross-team communication. I enjoy solving operational bottlenecks and creating systems that help teams work more efficiently. In my last role, I moved into a more strategic position where I could contribute to long-term planning and company-wide initiatives.' about yourself.`,
        exampleAnswer:
          'I have seven years of experience in corporate operations, with a focus on streamlining processes and improving cross-team communication. I enjoy solving operational bottlenecks and creating systems that help teams work more efficiently. In my last role, I moved into a more strategic position where I could contribute to long-term planning and company-wide initiatives.',
        difficulty: 'hard',
        expectedTopics: ['background', 'experience', 'strategic thinking'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Why do you want this job? Here is an answer you can use as a guide. Now why don't you try? 'I'm drawn to your emphasis on sustainable growth and your investment in employee development. The part that resonates with me is how you balance innovation with responsible governance. I was impressed by your recent expansion strategy, which reinforces your long-term vision.' why you want this job.`,
        exampleAnswer:
          "I'm drawn to your emphasis on sustainable growth and your investment in employee development. The part that resonates with me is how you balance innovation with responsible governance. I was impressed by your recent expansion strategy, which reinforces your long-term vision.",
        difficulty: 'hard',
        expectedTopics: ['motivation', 'company research', 'strategic alignment'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `What are your strengths? Here is an answer you can use as a guide. Now why don't you try? 'My strongest assets are structured thinking and diplomatic communication. I'm able to bring clarity to complex situations and keep stakeholders aligned, even when priorities shift.' about your strengths.`,
        exampleAnswer:
          "My strongest assets are structured thinking and diplomatic communication. I'm able to bring clarity to complex situations and keep stakeholders aligned, even when priorities shift.",
        difficulty: 'hard',
        expectedTopics: ['strengths', 'leadership', 'communication'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `What is one weakness? Here is an answer you can use as a guide. Now why don't you try? 'I used to take on too many commitments at once. I've learned to prioritize more rigorously and to set clearer boundaries. As a result, the quality of my output is consistently high without last-minute pressure.' about one weakness.`,
        exampleAnswer:
          "I used to take on too many commitments at once. I've learned to prioritize more rigorously and to set clearer boundaries. As a result, the quality of my output is consistently high without last-minute pressure.",
        difficulty: 'hard',
        expectedTopics: ['self-awareness', 'growth', 'improvement'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `Describe your ideal working environment. Here is an answer you can use as a guide. Now why don't you try? 'I thrive in environments that value accountability, open communication, and clear goals. I help keep the atmosphere constructive by being transparent, reliable, and proactive.' Now please describe your ideal working environment.`,
        exampleAnswer:
          'I thrive in environments that value accountability, open communication, and clear goals. I help keep the atmosphere constructive by being transparent, reliable, and proactive.',
        difficulty: 'hard',
        expectedTopics: ['work culture', 'values', 'team dynamics'],
      },
      {
        letter: 'F',
        question: (studentName: string) =>
          `Tell me about a time you worked under pressure. Here is an answer you can use as a guide. Now why don't you try? 'We had a last-minute client request that required rapid coordination. I created a quick escalation plan, delegated tasks based on strengths, and kept communication tight. We delivered on time, and I learned the value of staying calm and structured.' about a time you worked under pressure.`,
        exampleAnswer:
          'We had a last-minute client request that required rapid coordination. I created a quick escalation plan, delegated tasks based on strengths, and kept communication tight. We delivered on time, and I learned the value of staying calm and structured.',
        difficulty: 'hard',
        expectedTopics: ['stress management', 'leadership', 'problem-solving'],
      },
    ],
  },
  {
    id: 2,
    title: 'Behavioral & Problem-Solving',
    description: 'Advanced questions about past experiences and problem-solving abilities',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `Tell me about a time you influenced a decision without having direct authority. Here is an answer you can use as a guide. Now why don't you try? 'I focused first on understanding the stakeholders' concerns. Once I acknowledged their priorities, I reframed my proposal to show how it aligned with their goals. This created trust and shifted the discussion from positions to shared outcomes.' about a time you influenced a decision without having direct authority.`,
        exampleAnswer:
          "I focused first on understanding the stakeholders' concerns. Once I acknowledged their priorities, I reframed my proposal to show how it aligned with their goals. This created trust and shifted the discussion from positions to shared outcomes.",
        difficulty: 'hard',
        expectedTopics: ['influence', 'stakeholder management', 'negotiation'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `Describe a situation where the team was divided. What did you do? Here is an answer you can use as a guide. Now why don't you try? 'I brought everyone together for a focused conversation, clarified what was fact versus assumption, and identified the shared goal. Once the common objective was visible, disagreements became much easier to reconcile.' Now please describe a situation where the team was divided and what you did.`,
        exampleAnswer:
          'I brought everyone together for a focused conversation, clarified what was fact versus assumption, and identified the shared goal. Once the common objective was visible, disagreements became much easier to reconcile.',
        difficulty: 'hard',
        expectedTopics: ['conflict resolution', 'team leadership', 'mediation'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `Tell me about a project where the scope suddenly changed. Here is an answer you can use as a guide. Now why don't you try? 'I documented the impact of the new requirements, including risks and trade-offs, and then scheduled a quick decision call. Presenting structured scenarios helped leadership choose a realistic plan.' about a project where the scope suddenly changed.`,
        exampleAnswer:
          'I documented the impact of the new requirements, including risks and trade-offs, and then scheduled a quick decision call. Presenting structured scenarios helped leadership choose a realistic plan.',
        difficulty: 'hard',
        expectedTopics: ['change management', 'risk assessment', 'project management'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `Describe a time you had limited information but had to decide quickly. Here is an answer you can use as a guide. Now why don't you try? 'I identified what was absolutely essential, gathered the fastest reliable data available, and acted based on probability rather than perfection. Then I communicated early that adjustments might be needed.' Now please describe a time you had limited information but had to decide quickly.`,
        exampleAnswer:
          'I identified what was absolutely essential, gathered the fastest reliable data available, and acted based on probability rather than perfection. Then I communicated early that adjustments might be needed.',
        difficulty: 'hard',
        expectedTopics: ['decision-making', 'uncertainty', 'risk management'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `How do you handle someone who consistently resists change? Here is an answer you can use as a guide. Now why don't you try? 'I try to understand the underlying fear—loss of control, increased workload, lack of clarity. Once you address the real concern, resistance decreases. If needed, I set clear expectations and timelines.' how you handle someone who consistently resists change.`,
        exampleAnswer:
          'I try to understand the underlying fear—loss of control, increased workload, lack of clarity. Once you address the real concern, resistance decreases. If needed, I set clear expectations and timelines.',
        difficulty: 'hard',
        expectedTopics: ['change management', 'people management', 'empathy'],
      },
    ],
  },
  {
    id: 3,
    title: 'Salary, Bonuses, Vacation',
    description: 'Advanced questions about compensation and benefits expectations',
    questions: [
      {
        letter: 'A',
        question: (studentName: string) =>
          `What was your salary in your last job? Here is an answer you can use as a guide. Now why don't you try? 'I prefer to focus on the responsibilities and expectations of this role. I'm sure your compensation range is aligned with the market, so I would love to understand how you've structured the range for this position.' Now please answer this question.`,
        exampleAnswer:
          "I prefer to focus on the responsibilities and expectations of this role. I'm sure your compensation range is aligned with the market, so I would love to understand how you've structured the range for this position.",
        difficulty: 'hard',
        expectedTopics: ['salary negotiation', 'professionalism', 'tact'],
      },
      {
        letter: 'B',
        question: (studentName: string) =>
          `What salary are you expecting? Here is an answer you can use as a guide. Now why don't you try? 'Based on my experience and the industry benchmarks, I'm looking for a competitive package. Could you share the range you've budgeted for the role so I can position myself accurately?' what salary you are expecting.`,
        exampleAnswer:
          "Based on my experience and the industry benchmarks, I'm looking for a competitive package. Could you share the range you've budgeted for the role so I can position myself accurately?",
        difficulty: 'hard',
        expectedTopics: ['salary expectations', 'negotiation', 'market research'],
      },
      {
        letter: 'C',
        question: (studentName: string) =>
          `We need a number. What is your minimum? Here is an answer you can use as a guide. Now why don't you try? 'I'd like to understand the full compensation package (base salary, bonuses, benefits, vacation, and growth opportunities) before giving a figure, because each company structures compensation differently.' Now please answer this question.`,
        exampleAnswer:
          "I'd like to understand the full compensation package (base salary, bonuses, benefits, vacation, and growth opportunities) before giving a figure, because each company structures compensation differently.",
        difficulty: 'hard',
        expectedTopics: ['salary negotiation', 'total compensation', 'professionalism'],
      },
      {
        letter: 'D',
        question: (studentName: string) =>
          `How do bonuses fit into your overall compensation expectations? Here is an answer you can use as a guide. Now why don't you try? 'I value bonuses that are tied to clear, measurable objectives. They reinforce alignment between personal performance and company results.' about bonuses.`,
        exampleAnswer:
          'I value bonuses that are tied to clear, measurable objectives. They reinforce alignment between personal performance and company results.',
        difficulty: 'hard',
        expectedTopics: ['compensation', 'performance metrics', 'alignment'],
      },
      {
        letter: 'E',
        question: (studentName: string) =>
          `What are your expectations in terms of vacation? Here is an answer you can use as a guide. Now why don't you try? 'I believe time off is essential for long-term productivity and well-being. I'm flexible, but I do value a policy that allows for proper work-life balance.' about your vacation expectations.`,
        exampleAnswer:
          "I believe time off is essential for long-term productivity and well-being. I'm flexible, but I do value a policy that allows for proper work-life balance.",
        difficulty: 'hard',
        expectedTopics: ['work-life balance', 'wellness', 'benefits'],
      },
    ],
  },
];


/**
 * Prompt para Job Interview - Advanced - Free Mode
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../base/composer';
import {FREE_MODE_INSTRUCTIONS} from '../../../base/instructions';
import {FREE_FEEDBACK_STRUCTURE} from '../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../types';

export const getJobInterviewAdvancedFreePrompt = (
  context: PromptContext,
  turnNumber: number,
): PromptConfig => {
  const role = `You are an expert English virtual teacher conducting a personalized job interview simulation. You must respond in JSON format only.

YOUR ROLE:
You are a patient, encouraging English teacher helping Italian learners practice job interviews. You conduct natural, personalized conversations based on the company and position the student mentions.`;

  const systemPrompt = composeSystemPrompt(
    role,
    FREE_MODE_INSTRUCTIONS,
    FREE_FEEDBACK_STRUCTURE,
    `QUESTION GUIDELINES:
- Make questions relevant to the specific company and position
- Cover typical interview topics: experience, skills, motivation, teamwork, problem-solving, etc.
- Keep questions clear and appropriate for ADVANCED level
- You can use professional vocabulary and complex sentence structures
- Ask more sophisticated questions that demonstrate higher-level thinking
- After exactly 5 interview questions (after the initial company/position questions), provide a closing message

FEEDBACK GUIDELINES:
- Always be friendly, encouraging, and supportive
- Give brief, specific suggestions (1 sentence maximum)
- Keep feedback positive and constructive
- Be warm and approachable in your tone`,
  );

  const historyText = context.conversationHistory
    .map(
      msg =>
        `${msg.role === 'tutor' ? 'Tutor' : msg.role === 'user' ? 'Student' : 'Feedback'}: ${msg.text}`,
    )
    .join('\n');

  let userPrompt = '';

  if (turnNumber === 1) {
    userPrompt = `This is the first turn. Greet the student ${context.studentName} warmly and welcome them to the interview practice session.
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Your greeting message here",
      "question": "Your greeting message here",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 2) {
    // Pregunta 1 (fija): Solo la pregunta, sin feedback
    userPrompt = `Ask the student ONLY this question: "What company are you going to apply to?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "What company are you going to apply to?",
      "question": "What company are you going to apply to?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 3) {
    // Pregunta 2 (fija): Solo la pregunta, sin feedback
    userPrompt = `The student just answered about the company. Now ask ONLY this question: "What position are you going to apply for?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no reactions, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "What position are you going to apply for?",
      "question": "What position are you going to apply for?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 4) {
    // Transición + Primera pregunta dinámica (pregunta 3)
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const position = lastUserMessage?.text || context.positionName || 'the position';

    const companyMessage = context.conversationHistory
      .slice()
      .reverse()
      .slice(1)
      .find(msg => msg.role === 'user');
    const company = companyMessage?.text || context.companyName || 'the company';

    userPrompt = `The student just answered about the position: "${position}" for company: "${company}".
    
    Now you need to:
    1. Say a brief transition like: "Perfect! I'll help you practice an interview for ${company} as a ${position}. Let's begin!"
    2. Immediately after the transition, ask the FIRST interview question (question 3 of 7 total) relevant to the position "${position}" at ${company}.
    
    IMPORTANT:
    - Combine the transition and the first question in ONE message
    - This is the FIRST dynamic interview question
    - Make it relevant to the specific position and company
    - Use ADVANCED level vocabulary and professional, sophisticated language
    - Do NOT give feedback yet, just the transition + question
    - Base your question on the company and position the student mentioned
    - Examples: "Perfect! I'll help you practice an interview for ${company} as a ${position}. Let's begin! Why do you think you would be a good fit for ${company}?"`;
  } else if (turnNumber >= 5 && turnNumber <= 9) {
    // Primera pregunta dinámica (pregunta 3) - SIN feedback
    const positionMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const position = positionMessage?.text || context.positionName || 'the position';

    const companyMessage = context.conversationHistory
      .slice()
      .reverse()
      .slice(1)
      .find(msg => msg.role === 'user');
    const company = companyMessage?.text || context.companyName || 'the company';

    userPrompt = `Now ask the FIRST interview question (question 3 of 7 total) relevant to the position "${position}" at ${company}.
    
    IMPORTANT:
    - This is the FIRST dynamic interview question
    - Make it relevant to the specific position and company
    - Use ADVANCED level vocabulary and professional, sophisticated language
    - Do NOT give feedback yet, just ask the question
    - Base your question on the company and position the student mentioned
    - Examples: "Why do you think you would be a good fit for ${company}?" or "Can you describe a challenge you overcame that relates to ${position}?"`;
  } else if (turnNumber >= 6 && turnNumber <= 9) {
    // Preguntas 4-7 (dinámicas): Feedback breve + siguiente pregunta
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const companyMessage = context.conversationHistory
      .slice()
      .reverse()
      .find((msg, idx, arr) => {
        // Buscar el mensaje del usuario que contiene la company (debe estar antes de la position)
        const positionMsg = arr.find((m, i) => i > idx && m.role === 'user');
        return msg.role === 'user' && positionMsg;
      });
    const company = companyMessage?.text || context.companyName || 'the company';
    
    const positionMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const position = positionMessage?.text || context.positionName || 'the position';

    const dynamicQuestionNumber = turnNumber - 1; // Turn 5 = pregunta 4, Turn 6 = pregunta 5, etc.
    const questionsRemaining = 10 - turnNumber; // Cuántas preguntas quedan después de esta

    userPrompt = `The student just answered your previous interview question: "${lastUserMessage?.text || 'their answer'}"
    
    Conversation history:
    ${historyText}
    
    Now you need to:
    1. Give brief, friendly, and encouraging feedback (1 sentence maximum). Be specific and positive. Examples: "Good! Try to give a more specific example next time.", "Great answer!", "That's perfect!", "Well said!"
    2. Ask the NEXT interview question (question ${dynamicQuestionNumber} of 7 total) relevant to the position "${position}" at ${company}.
    
    IMPORTANT: 
    - This is dynamic interview question ${dynamicQuestionNumber} (${questionsRemaining} more to go)
    - Base your question on the student's previous answers, especially their company and position responses
    - Use ADVANCED level vocabulary and professional language. Questions should be sophisticated and demonstrate higher-level thinking.
    - Always be friendly, warm, and encouraging
    - Keep feedback brief and specific (1 sentence max)
    - Make questions relevant to the specific position "${position}" and company "${company}"
    - Examples: "What skills do you bring that could help the team here?" or "How do you handle pressure in a work environment?" or "What makes you interested in growing within ${company}?"
    
    After exactly 5 dynamic interview questions (turns 4-9), you will provide a closing message.`;
  } else if (turnNumber === 10) {
    // Cierre después del feedback de la pregunta 7
    userPrompt = `The student just answered your last interview question (question 7). You already gave feedback for that answer.
    
    Now provide a closing message like: "Great job! This completes our practice interview. If you want, we can repeat it or try a different role play."
    
    IMPORTANT:
    - This is the closing message
    - Be warm and encouraging
    - Do NOT ask any more questions
    - Do NOT give feedback again`;
  }

  return {
    systemPrompt,
    userPrompt: composeUserPrompt('', userPrompt),
    responseFormat: 'json_object',
  };
};


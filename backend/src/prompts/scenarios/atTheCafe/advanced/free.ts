/**
 * Prompt para At The Cafe - Advanced - Free Mode
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../base/composer';
import {FREE_MODE_INSTRUCTIONS} from '../../../base/instructions';
import {FREE_FEEDBACK_STRUCTURE} from '../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../types';

export const getAtTheCafeAdvancedFreePrompt = (
  context: PromptContext,
  turnNumber: number,
): PromptConfig => {
  const role = `You are an expert English virtual teacher conducting a personalized cafe interaction simulation. You must respond in JSON format only.

YOUR ROLE:
You are a friendly, patient English teacher helping Italian learners practice ordering at a cafe. You act as a cafe staff member and conduct natural, personalized conversations based on what the student wants to order.`;

  const systemPrompt = composeSystemPrompt(
    role,
    FREE_MODE_INSTRUCTIONS,
    FREE_FEEDBACK_STRUCTURE,
    `QUESTION GUIDELINES:
- Make questions relevant to cafe interactions: ordering, preferences, seating, payment, etc.
- Cover typical cafe topics: drinks, food, special requests, problems, small talk
- Keep questions clear and appropriate for ADVANCED level
- You can use professional vocabulary and complex sentence structures
- Ask more sophisticated questions that demonstrate higher-level thinking
- After exactly 5 cafe questions (after the initial ordering questions), provide a closing message

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
    userPrompt = `This is the first turn. Greet the student ${context.studentName} warmly as a cafe staff member and welcome them to the cafe.
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Your greeting message here",
      "question": "Your greeting message here",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 2) {
    userPrompt = `Ask the student ONLY this question: "What would you like?" or "What can I get you?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "What would you like?",
      "question": "What would you like?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 3) {
    userPrompt = `The student just told you what they want to order. Now ask ONLY this question: "For here or to go?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no reactions, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "For here or to go?",
      "question": "For here or to go?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 4) {
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const orderType = lastUserMessage?.text || 'their order';

    const firstOrderMessage = context.conversationHistory
      .slice()
      .reverse()
      .slice(1)
      .find(msg => msg.role === 'user');
    const order = firstOrderMessage?.text || 'their order';

    userPrompt = `The student just answered about their order preference: "${orderType}" for order: "${order}".
    
    Now you need to:
    1. Say a brief transition like: "Perfect! I'll get that ready for you. ${orderType === 'to go' || orderType.toLowerCase().includes('go') ? 'It will be ready in a few minutes.' : 'You can sit anywhere you like.'}"
    2. Immediately after the transition, ask the FIRST cafe question (question 3 of 7 total) relevant to their order or cafe experience.
    
    IMPORTANT:
    - Combine the transition and the first question in ONE message
    - This is the FIRST dynamic cafe question
    - Make it relevant to their order or cafe experience
    - Use ADVANCED level vocabulary and professional, sophisticated language
    - Do NOT give feedback yet, just the transition + question
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Perfect! I'll get that ready for you. [Your first cafe question here]",
      "question": "Perfect! I'll get that ready for you. [Your first cafe question here]",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber >= 5 && turnNumber <= 9) {
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');

    const dynamicQuestionNumber = turnNumber - 1;
    const questionsRemaining = 10 - turnNumber;

    userPrompt = `The student just answered your previous cafe question: "${lastUserMessage?.text || 'their answer'}"
    
    Conversation history:
    ${historyText}
    
    Now you need to:
    1. Give brief, friendly, and encouraging feedback (1 sentence maximum). Be specific and positive.
    2. Ask the NEXT cafe question (question ${dynamicQuestionNumber} of 7 total) relevant to cafe interactions.
    
    IMPORTANT: 
    - This is dynamic cafe question ${dynamicQuestionNumber} (${questionsRemaining} more to go)
    - Base your question on the student's previous answers
    - Use ADVANCED level vocabulary and professional language. Questions should be sophisticated.
    - Always be friendly, warm, and encouraging
    - Keep feedback brief and specific (1 sentence max)
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "[Feedback] [Question]",
      "feedback": "Your brief feedback here (1 sentence max)",
      "question": "Your next cafe question here",
      "shouldEnd": false
    }
    
    After exactly 5 dynamic cafe questions (turns 4-9), you will provide a closing message.`;
  } else if (turnNumber === 10) {
    userPrompt = `The student just answered your last cafe question (question 7). You already gave feedback for that answer.
    
    Now provide a closing message like: "Great job! This completes our cafe practice. If you want, we can repeat it or try a different role play."
    
    IMPORTANT:
    - This is the closing message
    - Be warm and encouraging
    - Do NOT ask any more questions
    - Do NOT give feedback again
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Great job! This completes our cafe practice. If you want, we can repeat it or try a different role play.",
      "question": "Great job! This completes our cafe practice. If you want, we can repeat it or try a different role play.",
      "feedback": null,
      "shouldEnd": true,
      "closingMessage": "Great job! This completes our cafe practice. If you want, we can repeat it or try a different role play."
    }`;
  }

  return {
    systemPrompt,
    userPrompt: composeUserPrompt('', userPrompt),
    responseFormat: 'json_object',
  };
};





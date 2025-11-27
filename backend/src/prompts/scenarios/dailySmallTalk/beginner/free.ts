/**
 * Prompt para Daily Small Talk - Beginner - Free Mode
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../base/composer';
import {FREE_MODE_INSTRUCTIONS} from '../../../base/instructions';
import {FREE_FEEDBACK_STRUCTURE} from '../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../types';

export const getDailySmallTalkBeginnerFreePrompt = (
  context: PromptContext,
  turnNumber: number,
): PromptConfig => {
  const role = `You are an expert English virtual teacher conducting a personalized daily small talk simulation. You must respond in JSON format only.

YOUR ROLE:
You are a friendly, patient English teacher helping Italian learners practice casual conversations. You act as a colleague or friendly neighbor and conduct natural, personalized small talk conversations.`;

  const systemPrompt = composeSystemPrompt(
    role,
    FREE_MODE_INSTRUCTIONS,
    FREE_FEEDBACK_STRUCTURE,
    `QUESTION GUIDELINES:
- Make questions relevant to daily small talk: greetings, weather, work, hobbies, weekend plans, etc.
- Cover typical small talk topics: day-to-day life, interests, casual questions, friendly conversation
- Keep questions clear and appropriate for BEGINNER level
- Use simple vocabulary and short sentences
- After exactly 5 small talk questions (after the initial greeting questions), provide a closing message

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
    userPrompt = `This is the first turn. Greet the student ${context.studentName} warmly as a colleague or friendly neighbor and start a casual conversation.
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Your greeting message here",
      "question": "Your greeting message here",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 2) {
    userPrompt = `Ask the student ONLY this question: "How's your day going?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "How's your day going?",
      "question": "How's your day going?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 3) {
    userPrompt = `The student just answered about their day. Now ask ONLY this question: "Is this your first time here?" or "Have you been here before?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no reactions, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Is this your first time here?",
      "question": "Is this your first time here?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 4) {
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const firstAnswer = lastUserMessage?.text || 'their answer';

    const dayAnswer = context.conversationHistory
      .slice()
      .reverse()
      .slice(1)
      .find(msg => msg.role === 'user');
    const dayResponse = dayAnswer?.text || 'their day';

    userPrompt = `The student just answered about being here: "${firstAnswer}" and earlier about their day: "${dayResponse}".
    
    Now you need to:
    1. Say a brief transition like: "That's nice! I'm glad to hear that. Let's chat a bit more."
    2. Immediately after the transition, ask the FIRST small talk question (question 3 of 7 total) relevant to daily conversation.
    
    IMPORTANT:
    - Combine the transition and the first question in ONE message
    - This is the FIRST dynamic small talk question
    - Make it relevant to daily conversation topics
    - Keep it SIMPLE for a BEGINNER level student
    - Do NOT give feedback yet, just the transition + question
    - Examples: "That's nice! I'm glad to hear that. What do you usually do on weekends?" or "Great! What do you like doing in your free time?"
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "That's nice! I'm glad to hear that. [Your first small talk question here]",
      "question": "That's nice! I'm glad to hear that. [Your first small talk question here]",
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

    userPrompt = `The student just answered your previous small talk question: "${lastUserMessage?.text || 'their answer'}"
    
    Conversation history:
    ${historyText}
    
    Now you need to:
    1. Give brief, friendly, and encouraging feedback (1 sentence maximum). Be specific and positive. Examples: "Good! Try to give a more specific example next time.", "Great answer!", "That's perfect!", "Well said!"
    2. Ask the NEXT small talk question (question ${dynamicQuestionNumber} of 7 total) relevant to daily conversation.
    
    IMPORTANT: 
    - This is dynamic small talk question ${dynamicQuestionNumber} (${questionsRemaining} more to go)
    - Base your question on the student's previous answers
    - Keep questions SIMPLE and appropriate for BEGINNER level. Use easy vocabulary.
    - Always be friendly, warm, and encouraging
    - Keep feedback brief and specific (1 sentence max)
    - Make questions relevant to daily small talk: hobbies, weekend plans, work, weather, interests
    - Examples: "What do you usually do on weekends?" or "Have you seen any good movies lately?" or "Do you have any plans for later?"
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "[Feedback] [Question]",
      "feedback": "Your brief feedback here (1 sentence max)",
      "question": "Your next small talk question here",
      "shouldEnd": false
    }
    
    After exactly 5 dynamic small talk questions (turns 4-9), you will provide a closing message.`;
  } else if (turnNumber === 10) {
    userPrompt = `The student just answered your last small talk question (question 7). You already gave feedback for that answer.
    
    Now provide a closing message like: "Great job! This completes our small talk practice. If you want, we can repeat it or try a different role play."
    
    IMPORTANT:
    - This is the closing message
    - Be warm and encouraging
    - Do NOT ask any more questions
    - Do NOT give feedback again
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Great job! This completes our small talk practice. If you want, we can repeat it or try a different role play.",
      "question": "Great job! This completes our small talk practice. If you want, we can repeat it or try a different role play.",
      "feedback": null,
      "shouldEnd": true,
      "closingMessage": "Great job! This completes our small talk practice. If you want, we can repeat it or try a different role play."
    }`;
  }

  return {
    systemPrompt,
    userPrompt: composeUserPrompt('', userPrompt),
    responseFormat: 'json_object',
  };
};




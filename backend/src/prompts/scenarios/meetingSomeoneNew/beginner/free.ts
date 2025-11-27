/**
 * Prompt para Meeting Someone New - Beginner - Free Mode
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../base/composer';
import {FREE_MODE_INSTRUCTIONS} from '../../../base/instructions';
import {FREE_FEEDBACK_STRUCTURE} from '../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../types';

export const getMeetingSomeoneNewBeginnerFreePrompt = (
  context: PromptContext,
  turnNumber: number,
): PromptConfig => {
  const role = `You are an expert English virtual teacher conducting a personalized meeting someone new simulation. You must respond in JSON format only.

YOUR ROLE:
You are a friendly, patient English teacher helping Italian learners practice meeting new people. You act as someone they just met at an event and conduct natural, personalized conversations.`;

  const systemPrompt = composeSystemPrompt(
    role,
    FREE_MODE_INSTRUCTIONS,
    FREE_FEEDBACK_STRUCTURE,
    `QUESTION GUIDELINES:
- Make questions relevant to meeting someone new: introductions, background, interests, work, hobbies, etc.
- Cover typical meeting topics: name, origin, work, interests, how they know people, event-related questions
- Keep questions clear and appropriate for BEGINNER level
- Use simple vocabulary and short sentences
- After exactly 5 meeting questions (after the initial name/origin questions), provide a closing message

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
    userPrompt = `This is the first turn. Greet the student ${context.studentName} warmly as someone you just met at an event and start the conversation.
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Your greeting message here",
      "question": "Your greeting message here",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 2) {
    userPrompt = `Ask the student ONLY this question: "Nice to meet you. What's your name?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Nice to meet you. What's your name?",
      "question": "Nice to meet you. What's your name?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 3) {
    userPrompt = `The student just told you their name. Now ask ONLY this question: "Where are you from?"
    
    IMPORTANT: 
    - Return ONLY the question, no feedback, no reactions, no additional comments
    - Do NOT include any example or explanation
    - Wait for the student's response before continuing
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Where are you from?",
      "question": "Where are you from?",
      "feedback": null,
      "shouldEnd": false
    }`;
  } else if (turnNumber === 4) {
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const origin = lastUserMessage?.text || 'their origin';

    const nameMessage = context.conversationHistory
      .slice()
      .reverse()
      .slice(1)
      .find(msg => msg.role === 'user');
    const name = nameMessage?.text || 'their name';

    userPrompt = `The student just told you where they're from: "${origin}" and earlier their name: "${name}".
    
    Now you need to:
    1. Say a brief transition like: "That's great! Nice to meet you, ${name}. It's nice to meet someone from ${origin}."
    2. Immediately after the transition, ask the FIRST meeting question (question 3 of 7 total) relevant to getting to know them.
    
    IMPORTANT:
    - Combine the transition and the first question in ONE message
    - This is the FIRST dynamic meeting question
    - Make it relevant to meeting someone new
    - Keep it SIMPLE for a BEGINNER level student
    - Do NOT give feedback yet, just the transition + question
    - Examples: "That's great! Nice to meet you, ${name}. What do you do for work?" or "That's nice! Is this your first time at this event?"
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "That's great! Nice to meet you, ${name}. [Your first meeting question here]",
      "question": "That's great! Nice to meet you, ${name}. [Your first meeting question here]",
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

    userPrompt = `The student just answered your previous meeting question: "${lastUserMessage?.text || 'their answer'}"
    
    Conversation history:
    ${historyText}
    
    Now you need to:
    1. Give brief, friendly, and encouraging feedback (1 sentence maximum). Be specific and positive. Examples: "Good! Try to give a more specific example next time.", "Great answer!", "That's perfect!", "Well said!"
    2. Ask the NEXT meeting question (question ${dynamicQuestionNumber} of 7 total) relevant to getting to know someone new.
    
    IMPORTANT: 
    - This is dynamic meeting question ${dynamicQuestionNumber} (${questionsRemaining} more to go)
    - Base your question on the student's previous answers, especially their name and origin
    - Keep questions SIMPLE and appropriate for BEGINNER level. Use easy vocabulary.
    - Always be friendly, warm, and encouraging
    - Keep feedback brief and specific (1 sentence max)
    - Make questions relevant to meeting someone new: work, interests, how they know people, event-related questions
    - Examples: "What do you do for work?" or "How do you know the host?" or "What do you like doing in your free time?"
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "[Feedback] [Question]",
      "feedback": "Your brief feedback here (1 sentence max)",
      "question": "Your next meeting question here",
      "shouldEnd": false
    }
    
    After exactly 5 dynamic meeting questions (turns 4-9), you will provide a closing message.`;
  } else if (turnNumber === 10) {
    userPrompt = `The student just answered your last meeting question (question 7). You already gave feedback for that answer.
    
    Now provide a closing message like: "Great job! This completes our meeting someone new practice. If you want, we can repeat it or try a different role play."
    
    IMPORTANT:
    - This is the closing message
    - Be warm and encouraging
    - Do NOT ask any more questions
    - Do NOT give feedback again
    
    RESPONSE FORMAT (JSON):
    {
      "tutorMessage": "Great job! This completes our meeting someone new practice. If you want, we can repeat it or try a different role play.",
      "question": "Great job! This completes our meeting someone new practice. If you want, we can repeat it or try a different role play.",
      "feedback": null,
      "shouldEnd": true,
      "closingMessage": "Great job! This completes our meeting someone new practice. If you want, we can repeat it or try a different role play."
    }`;
  }

  return {
    systemPrompt,
    userPrompt: composeUserPrompt('', userPrompt),
    responseFormat: 'json_object',
  };
};




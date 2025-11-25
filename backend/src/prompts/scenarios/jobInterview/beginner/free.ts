/**
 * Prompt para Job Interview - Beginner - Free Mode
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../base/composer';
import {FREE_MODE_INSTRUCTIONS} from '../../../base/instructions';
import {FREE_FEEDBACK_STRUCTURE} from '../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../types';

export const getJobInterviewBeginnerFreePrompt = (
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
- Keep questions clear and appropriate for BEGINNER level
- Use simple vocabulary and short sentences
- After 8-10 questions, provide a closing message`,
  );

  const historyText = context.conversationHistory
    .map(
      msg =>
        `${msg.role === 'tutor' ? 'Tutor' : msg.role === 'user' ? 'Student' : 'Feedback'}: ${msg.text}`,
    )
    .join('\n');

  let userPrompt = '';

  if (turnNumber === 1) {
    userPrompt = `This is the first turn. Greet the student ${context.studentName} warmly and welcome them to the interview practice session.`;
  } else if (turnNumber === 2) {
    userPrompt = `Ask the student: "What company are you going to apply to?"`;
  } else if (turnNumber === 3) {
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const company = lastUserMessage?.text || context.companyName || 'the company';

    userPrompt = `The student just answered about the company: "${company}". 
    React positively with something brief like "Great!" or "Perfect!", then ask: "What position are you going to apply for?"`;
  } else if (turnNumber === 4) {
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

    userPrompt = `The student just answered about the position: "${position}".
    
    Now you need to:
    1. React positively with something brief like "Great!" or "Perfect!"
    2. Say something like: "Great, I will help you practice an interview for ${company}. Let's begin!"
    3. Ask the FIRST interview question relevant to the position "${position}" at ${company}.
    
    Make this first question relevant to the specific position and company. Keep it SIMPLE for a BEGINNER level student.`;
  } else {
    const lastUserMessage = context.conversationHistory
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    const interviewQuestionsCount = turnNumber - 4;

    userPrompt = `The student just answered your previous interview question: "${lastUserMessage?.text || 'their answer'}"
    
    Conversation history:
    ${historyText}
    
    Now you need to:
    1. Give brief, positive feedback (1-2 sentences max) like "Great!", "Perfect!", "That's excellent!", "Well said!"
    2. Ask the NEXT interview question relevant to the position and company mentioned earlier.
    
    You have asked ${interviewQuestionsCount} interview question(s) so far. Continue with personalized questions until you reach at least 8 total interview questions.
    
    IMPORTANT: Keep questions SIMPLE and appropriate for BEGINNER level. Use easy vocabulary.
    
    After 8-10 questions, you can start wrapping up with a closing message like: "Thank you for the interview practice, ${context.studentName}. You did great! Keep practicing."`;
  }

  return {
    systemPrompt,
    userPrompt: composeUserPrompt('', userPrompt),
    responseFormat: 'json_object',
  };
};


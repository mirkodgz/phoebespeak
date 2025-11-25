/**
 * Prompt para Job Interview - Advanced - Guided Mode
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../base/composer';
import {GUIDED_MODE_INSTRUCTIONS} from '../../../base/instructions';
import {
  GUIDED_FEEDBACK_STRUCTURE,
  ADVANCED_FEEDBACK_GUIDELINES,
} from '../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../types';

export const getJobInterviewAdvancedGuidedPrompt = (
  context: PromptContext,
): PromptConfig => {
  const role = `You are an expert English virtual teacher conducting a job interview simulation. You must respond in JSON format only.

YOUR ROLE:
You are a patient, encouraging English teacher helping Italian learners practice job interviews. You conduct natural conversations while providing constructive feedback.`;

  const systemPrompt = composeSystemPrompt(
    role,
    GUIDED_MODE_INSTRUCTIONS,
    GUIDED_FEEDBACK_STRUCTURE,
    ADVANCED_FEEDBACK_GUIDELINES,
  );

  const historyText = context.conversationHistory
    .map(
      msg =>
        `${msg.role === 'tutor' ? 'Tutor' : msg.role === 'user' ? 'Student' : 'Feedback'}: ${msg.text}`,
    )
    .join('\n');

  const userPrompt = composeUserPrompt(
    `You are conducting a job interview in English with an advanced-level student named ${context.studentName}.

Current turn number: ${context.turnNumber || 1}

Conversation history so far:
${historyText}`,
    `Based on the conversation history, generate the NEXT question or response from the tutor.

IMPORTANT INSTRUCTIONS:
- If this is turn 1 and there's no greeting yet, start with: "Welcome, ${context.studentName}! What was your last job?"
- If the student just answered, provide feedback in ENGLISH (3-4 sentences) with nuanced suggestions appropriate for advanced level.
- Ask questions that are more complex and professional, appropriate for advanced speakers.
- After 4-5 questions, you can start wrapping up the interview.

You must respond ONLY with valid JSON.

Return a JSON object with this structure:
{
  "tutorMessage": "string - The feedback in ENGLISH followed by the next question in English, or just the question if it's the first turn",
  "shouldEnd": boolean - true if the conversation should end,
  "closingMessage": "string - Optional closing message if shouldEnd is true"
}`,
  );

  return {
    systemPrompt,
    userPrompt,
    responseFormat: 'json_object',
  };
};


/**
 * Prompt principal para Job Interview - Beginner - Guided Mode
 * (Sin rounds, para cuando no hay preguntas predefinidas)
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../../base/composer';
import {GUIDED_MODE_INSTRUCTIONS} from '../../../../base/instructions';
import {
  GUIDED_FEEDBACK_STRUCTURE,
  BEGINNER_FEEDBACK_GUIDELINES,
} from '../../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../../types';

export const getJobInterviewBeginnerGuidedPrompt = (
  context: PromptContext,
): PromptConfig => {
  const role = `You are an expert English virtual teacher conducting a job interview simulation. You must respond in JSON format only.

YOUR ROLE:
You are a patient, encouraging English teacher helping Italian learners practice job interviews. You conduct natural conversations while providing constructive feedback.`;

  const systemPrompt = composeSystemPrompt(
    role,
    GUIDED_MODE_INSTRUCTIONS,
    GUIDED_FEEDBACK_STRUCTURE,
    BEGINNER_FEEDBACK_GUIDELINES,
  );

  const historyText = context.conversationHistory
    .map(
      msg =>
        `${msg.role === 'tutor' ? 'Tutor' : msg.role === 'user' ? 'Student' : 'Feedback'}: ${msg.text}`,
    )
    .join('\n');

  const userPrompt = composeUserPrompt(
    `You are conducting a job interview in English with a beginner-level student named ${context.studentName}.

Current turn number: ${context.turnNumber || 1}

Conversation history so far:
${historyText}`,
    `Based on the conversation history, generate the NEXT question or response from the tutor.

IMPORTANT INSTRUCTIONS:
- If this is turn 1 and there's no greeting yet, start with: "Hello, ${context.studentName}. Nice to see you today. Tell me about yourself. Here is an answer you can use as a guide. Now why don't you try? 'I am a positive person. I like working with people. I learn fast, and I enjoy doing a good job.'"
- If the student just answered, you need to:
  1. Provide feedback in ENGLISH (3-4 sentences) following this structure:
     * Recognition: What they did well (be specific about words, phrases, or pronunciation - e.g., "You pronounced 'experience' correctly" or "You used the structure 'I like...' well")
     * Specific Suggestion: ONE clear improvement tip with pronunciation guide if needed (use phonetic notation like /θ/, /wɜːrk/ and explain in simple English - e.g., "Try pronouncing 'think' /θɪŋk/ with the 'th' sound /θ/ like when you blow air")
     * Example Response: ONE concrete example of a better way to respond, directly related to the question you asked (e.g., if you asked "Tell me about yourself", provide an example like "You could say: 'I am a hard worker and I enjoy learning new things'")
     * Encouragement: A brief, motivating note (e.g., "Keep going, you're improving!")
  2. Then ask the next natural follow-up question in English
- Keep questions simple and appropriate for beginner level.
- After 4-5 questions, you can start wrapping up the interview.
- If it's time to end (after 4-5 questions), provide a closing message like: "Thank you for the interview, ${context.studentName}. You did great! Keep practicing."

You must respond ONLY with valid JSON. Do not include any text before or after the JSON.

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


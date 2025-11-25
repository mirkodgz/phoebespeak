/**
 * Prompt base para rounds de Daily Small Talk - Intermediate - Guided Mode
 * Este prompt se usa cuando hay preguntas predefinidas (rounds)
 */

import {
  composeSystemPrompt,
  composeUserPrompt,
} from '../../../../../base/composer';
import {ROUNDS_INSTRUCTIONS} from '../../../../../base/instructions';
import {
  GUIDED_FEEDBACK_STRUCTURE,
  INTERMEDIATE_FEEDBACK_GUIDELINES,
} from '../../../../../base/feedback-structures';
import type {PromptConfig, PromptContext} from '../../../../../types';

export const getDailySmallTalkIntermediateGuidedRoundPrompt = (
  context: PromptContext,
  predefinedQuestion: string,
): PromptConfig => {
  const role = `You are an expert English virtual teacher conducting a daily small talk conversation simulation. You must respond in JSON format only.

YOUR ROLE:
You are a patient, encouraging English teacher helping Italian learners practice casual everyday conversations in English at an intermediate level. You provide constructive feedback that helps students improve their speaking skills in friendly, informal situations with more detailed suggestions appropriate for intermediate learners.`;

  const systemPrompt = composeSystemPrompt(
    role,
    ROUNDS_INSTRUCTIONS,
    GUIDED_FEEDBACK_STRUCTURE,
    INTERMEDIATE_FEEDBACK_GUIDELINES,
  );

  const historyText = context.conversationHistory
    .map(
      msg =>
        `${msg.role === 'tutor' ? 'Tutor' : msg.role === 'user' ? 'Student' : 'Feedback'}: ${msg.text}`,
    )
    .join('\n');

  const userPrompt = composeUserPrompt(
    `The student just answered your previous question in a casual daily conversation.

Conversation history so far:
${historyText}

The question that was asked: [Find the last tutor question in the conversation history]

The student's answer: [Find the last student/user message in the conversation history]`,
    `Now you need to:
1. Analyze their answer carefully - what did they say correctly? What needs improvement?
2. Provide helpful feedback in ENGLISH (3-4 sentences) following this structure:
   - Recognition: What they did well (be specific about words, phrases, or pronunciation - e.g., "You used 'thanks' correctly" or "You structured your response well with 'I usually'")
   - Specific Suggestion: ONE clear improvement tip with pronunciation guide if needed (use phonetic notation like /θ/, /wel/ and explain in simple English)
   - Example Response: ONE concrete example of a better way to respond, based on the question that was asked
   - Encouragement: A brief, motivating note

3. The next question is already defined and will be asked separately: "${predefinedQuestion}"

IMPORTANT: 
- Only provide feedback in ENGLISH so the avatar can pronounce it. Do NOT include the question in your response.
- Be specific: Instead of "good job", say exactly what was good (e.g., "You used 'thanks' correctly")
- Make pronunciation tips clear: Use phonetic notation AND explain in simple English
- Make examples relevant: Base them on the actual casual conversation question that was asked
- Use intermediate-level English that is clear and natural

Return a JSON object with this structure:
{
  "feedback": "string - Your helpful feedback in ENGLISH (3-4 sentences, no question)",
  "question": "string - The predefined question exactly as provided: ${predefinedQuestion}",
  "shouldEnd": false
}`,
  );

  return {
    systemPrompt,
    userPrompt,
    responseFormat: 'json_object',
  };
};


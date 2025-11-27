/**
 * Servicio para chat libre con el tutor AI
 * Permite conversaciones libres sobre cualquier tema relacionado con la enseñanza del inglés
 */

import {openaiClient, OPENAI_MODEL_FEEDBACK} from './openai';

type TutorChatInput = {
  conversationHistory: Array<{
    role: 'tutor' | 'user';
    text: string;
  }>;
  studentName: string;
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
  message: string; // El mensaje actual del estudiante
};

type TutorChatResponse = {
  tutorMessage: string;
};

/**
 * Genera una respuesta del tutor para un chat libre sobre enseñanza de inglés
 */
export const generateTutorChatResponse = async ({
  conversationHistory,
  studentName,
  studentLevel = 'beginner',
  message,
}: TutorChatInput): Promise<TutorChatResponse> => {
  const systemPrompt = `You are an expert, friendly, and patient English teacher helping Italian learners improve their English. You can discuss any topic related to English learning, including:

- Grammar explanations
- Vocabulary help
- Pronunciation tips
- Writing assistance
- Conversation practice
- Learning strategies
- Cultural aspects of English
- Common mistakes and how to fix them
- Study tips and resources

YOUR STYLE:
- Be warm, encouraging, and supportive
- Adapt your language to the student's level (${studentLevel})
- Give clear, practical explanations
- Use examples when helpful
- Be conversational and friendly
- If the student asks something unrelated to English learning, gently redirect to English topics
- Always respond in English (unless the student specifically asks for Italian)

RESPONSE FORMAT:
Respond naturally in a conversational way. You don't need to use JSON format - just respond as a helpful teacher would.`;

  const historyText = conversationHistory
    .map(
      msg =>
        `${msg.role === 'tutor' ? 'Tutor' : 'Student'}: ${msg.text}`,
    )
    .join('\n');

  const userPrompt = `Student: ${studentName}
Level: ${studentLevel}

Conversation history:
${historyText || '(This is the start of the conversation)'}

Student's current message: "${message}"

Please respond naturally and helpfully as the tutor.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL_FEEDBACK,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7, // Un poco más creativo para conversaciones naturales
    });

    const tutorMessage = completion.choices[0]?.message?.content?.trim() || 
      "I'm here to help you with your English! What would you like to know?";

    return {
      tutorMessage,
    };
  } catch (error) {
    console.error('[openaiTutorChat] Error generating response:', error);
    throw error;
  }
};




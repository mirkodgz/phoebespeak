import {openaiClient} from './openai';

const OPENAI_MODEL_FEEDBACK = process.env.OPENAI_FEEDBACK_MODEL ?? 'gpt-4o-mini';

type GenerateFreeInterviewInput = {
  conversationHistory: Array<{
    role: 'tutor' | 'user' | 'feedback';
    text: string;
  }>;
  studentName: string;
  turnNumber: number;
  companyName?: string; // Nombre de la empresa mencionada por el usuario
  positionName?: string; // Nombre del puesto mencionado por el usuario
  scenarioId?: string; // Escenario (jobInterview, atTheCafe, etc.)
  levelId?: string; // Nivel (beginner, intermediate, advanced)
};

/**
 * Genera el siguiente turno de conversación para el modo libre de entrevista
 * 
 * Flujo:
 * - Turn 1: Saludo inicial
 * - Turn 2: Primera pregunta "What company are you going to apply to?"
 * - Turn 3: Segunda pregunta "What position are you going to apply for?"
 * - Turn 4+: Simulación de entrevista personalizada con al menos 8 preguntas
 */
export const generateFreeInterviewTurn = async ({
  conversationHistory,
  studentName,
  turnNumber,
  companyName,
  positionName,
  scenarioId = 'jobInterview', // Por ahora solo jobInterview, pero preparado para otros
  levelId = 'beginner', // Por ahora solo beginner, pero preparado para otros
}: GenerateFreeInterviewInput & {
  scenarioId?: string;
  levelId?: string;
}) => {
  // Importar el sistema de prompts
  const {getPrompt} = await import('../prompts');
  
  // Usar el nuevo sistema de prompts
  const promptConfig = getPrompt({
    scenarioId: scenarioId as any,
    levelId: levelId as any,
    mode: 'free',
    context: {
      studentName,
      conversationHistory,
      turnNumber,
      companyName,
      positionName,
    },
  });

  try {
    const completion = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL_FEEDBACK,
      response_format: {type: promptConfig.responseFormat || 'json_object'},
      messages: [
        {
          role: 'system',
          content: promptConfig.systemPrompt,
        },
        {
          role: 'user',
          content: promptConfig.userPrompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(text) as {
      tutorMessage?: string;
      feedback?: string;
      question?: string;
      shouldEnd?: boolean;
      closingMessage?: string;
    };

    const tutorMsg = typeof parsed.tutorMessage === 'string'
      ? parsed.tutorMessage
      : parsed.question || "That's great! Can you tell me more?";

    // Separar feedback y pregunta si están juntos
    let feedback = parsed.feedback;
    let question = parsed.question || tutorMsg;
    
    // Si no hay feedback separado, intentar extraerlo
    if (!feedback && tutorMsg) {
      // Buscar patrones comunes de feedback al inicio
      const feedbackPatterns = [
        /^(Great!|Perfect!|Excellent!|That's excellent!|Well said!|Good answer!|That's great!)[\s,.-]+/i,
        /^(Great|Perfect|Excellent)[\s,.-]+/i,
      ];
      
      for (const pattern of feedbackPatterns) {
        const match = tutorMsg.match(pattern);
        if (match) {
          feedback = match[1];
          question = tutorMsg.replace(pattern, '').trim();
          break;
        }
      }
    }

    // Asegurar que siempre haya un tutorMessage
    const finalTutorMessage = tutorMsg || question || "That's great! Can you tell me more?";
    
    return {
      feedback: feedback || undefined,
      question: question || finalTutorMessage,
      tutorMessage: finalTutorMessage,
      shouldEnd: parsed.shouldEnd === true || (parsed.closingMessage ? true : false),
      closingMessage: parsed.closingMessage,
    };
  } catch (error) {
    console.error('[openailiberainterview] generateFreeInterviewTurn error', error);
    throw error;
  }
};


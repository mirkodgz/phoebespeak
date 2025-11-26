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
    let parsed: {
      tutorMessage?: string;
      feedback?: string;
      question?: string;
      shouldEnd?: boolean;
      closingMessage?: string;
    };
    
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error('[openailiberainterview] JSON parse error:', parseError, 'Text:', text);
      // Si falla el parseo, intentar extraer el mensaje del texto directamente
      parsed = {
        tutorMessage: text.trim() || "That's great! Can you tell me more?",
        question: text.trim() || "That's great! Can you tell me more?",
      };
    }

    const tutorMsg = typeof parsed.tutorMessage === 'string' && parsed.tutorMessage.trim()
      ? parsed.tutorMessage.trim()
      : (typeof parsed.question === 'string' && parsed.question.trim()
          ? parsed.question.trim()
          : (turnNumber === 1 
              ? `Hello, ${studentName}! Welcome to the interview practice.`
              : turnNumber === 2
              ? "What company are you going to apply to?"
              : turnNumber === 3
              ? "What position are you going to apply for?"
              : "That's great! Can you tell me more?"));

    // Separar feedback y pregunta si están juntos
    let feedback = parsed.feedback;
    let question = parsed.question || tutorMsg;
    
    // En turns 2 y 3, NO extraer feedback (solo preguntas fijas)
    // En turn 4, NO extraer feedback (transición + primera pregunta dinámica)
    // En turns 5-9, SÍ extraer feedback si existe (feedback + preguntas 4-7)
    const shouldExtractFeedback = turnNumber >= 5 && turnNumber <= 9;
    
    // Si no hay feedback separado, intentar extraerlo solo en turns 5-9
    if (!feedback && tutorMsg && shouldExtractFeedback) {
      // Buscar patrones comunes de feedback al inicio
      const feedbackPatterns = [
        /^(Great!|Perfect!|Excellent!|That's excellent!|Well said!|Good answer!|That's great!|Good!)[\s,.-]+/i,
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
    
    // En turns 2, 3 y 4, asegurar que no haya feedback
    if (turnNumber === 2 || turnNumber === 3 || turnNumber === 4) {
      feedback = undefined;
      question = tutorMsg; // Usar el mensaje completo como pregunta/transición
    }

    // Asegurar que siempre haya un tutorMessage
    const finalTutorMessage = tutorMsg || question || "That's great! Can you tell me more?";
    
    // Forzar cierre en turn 10 (después de 7 preguntas: 2 fijas + 5 dinámicas)
    const shouldEndTurn = turnNumber === 10 || parsed.shouldEnd === true || (parsed.closingMessage ? true : false);
    
    return {
      feedback: feedback || undefined,
      question: question || finalTutorMessage,
      tutorMessage: finalTutorMessage,
      shouldEnd: shouldEndTurn,
      closingMessage: parsed.closingMessage || (shouldEndTurn && turnNumber === 10 
        ? "Great job! This completes our practice interview. If you want, we can repeat it or try a different role play."
        : undefined),
    };
  } catch (error) {
    console.error('[openailiberainterview] generateFreeInterviewTurn error', error);
    throw error;
  }
};


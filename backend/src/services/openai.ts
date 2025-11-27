import OpenAI from 'openai';
import type {Express} from 'express';
import {toFile} from 'openai/uploads';

export const OPENAI_MODEL_FEEDBACK = process.env.OPENAI_FEEDBACK_MODEL ?? 'gpt-4o-mini';
const OPENAI_TRANSCRIBE_MODEL =
  process.env.OPENAI_TRANSCRIBE_MODEL ?? 'whisper-1';

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. OpenAI requests will fail.');
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type TranscriptSegment = {
  text: string;
  confidence?: number;
  start?: number;
  end?: number;
};

type GeneratePracticeFeedbackInput = {
  transcript: string;
  targetSentence?: string; // Opcional para flujos dinámicos
  learnerProfile?: {
    nativeLanguage?: string;
    proficiencyLevel?: string;
    learnerName?: string;
  };
  transcriptionSegments?: TranscriptSegment[];
  conversationContext?: {
    scenarioId?: string;
    levelId?: string;
    currentTopic?: string;
  };
};

type GenerateNextTurnInput = {
  scenarioId: string;
  levelId: string;
  conversationHistory: Array<{
    role: 'tutor' | 'user' | 'feedback';
    text: string;
  }>;
  studentName: string;
  turnNumber: number;
  predefinedQuestions?: string[]; // Preguntas predefinidas para usar en orden
};

export const transcribeAudio = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error('Audio file is required for transcription');
  }

  const uploadFile = await toFile(file.buffer, file.originalname ?? 'practice.wav', {
    type: file.mimetype ?? 'audio/wav',
  });

  try {
    const response = await openaiClient.audio.transcriptions.create({
      file: uploadFile,
      model: OPENAI_TRANSCRIBE_MODEL,
      response_format: 'verbose_json',
      language: 'en', // Forzar inglés para evitar transcripciones en otros idiomas
    });

    return response;
  } catch (error) {
    console.error('[openai] transcription error', error);
    throw error;
  }
};

type SegmentConfidenceMetrics = {
  segmentCount: number;
  averageConfidence?: number;
  lowestConfidence?: number;
  belowThresholdCount: number;
};

const computeConfidenceMetrics = (
  segments?: TranscriptSegment[],
): SegmentConfidenceMetrics | null => {
  if (!segments || segments.length === 0) {
    return null;
  }

  const confidences = segments
    .map(segment => segment.confidence)
    .filter((value): value is number => typeof value === 'number');

  if (confidences.length === 0) {
    return {
      segmentCount: segments.length,
      belowThresholdCount: 0,
    };
  }

  const sum = confidences.reduce((acc, confidence) => acc + confidence, 0);
  const lowestConfidence = Math.min(...confidences);
  const belowThresholdCount = confidences.filter(confidence => confidence < 0.88)
    .length;

  return {
    segmentCount: segments.length,
    averageConfidence: sum / confidences.length,
    lowestConfidence,
    belowThresholdCount,
  };
};

const coerceVerdict = (
  provisionalVerdict: unknown,
  score: unknown,
  metrics: SegmentConfidenceMetrics | null,
): 'correct' | 'needs_improvement' => {
  const numericScore =
    typeof score === 'number' ? Math.max(0, Math.min(100, score)) : undefined;

  if (metrics) {
    if (
      typeof metrics.lowestConfidence === 'number' &&
      metrics.lowestConfidence < 0.82
    ) {
      return 'needs_improvement';
    }
    if (
      typeof metrics.averageConfidence === 'number' &&
      metrics.averageConfidence < 0.9
    ) {
      return 'needs_improvement';
    }
    if (metrics.belowThresholdCount > Math.max(1, Math.floor(metrics.segmentCount * 0.3))) {
      return 'needs_improvement';
    }
  }

  if (typeof numericScore === 'number' && numericScore < 88) {
    return 'needs_improvement';
  }

  return provisionalVerdict === 'correct' ? 'correct' : 'needs_improvement';
};

export const generatePracticeFeedback = async ({
  transcript,
  targetSentence,
  learnerProfile,
  transcriptionSegments,
  conversationContext,
}: GeneratePracticeFeedbackInput) => {

  const confidenceMetrics = computeConfidenceMetrics(transcriptionSegments);

  // Prompt adaptativo: si hay targetSentence, compara; si no, evalúa calidad general
  const prompt = targetSentence
    ? `You are an expert English pronunciation coach helping Italian learners practice speaking English. You must respond in JSON format only.

YOUR ROLE:
You provide personalized, constructive feedback that helps students improve their English speaking skills. Your feedback should be specific, actionable, and encouraging.

CRITICAL INSTRUCTIONS:
- The student is speaking in ENGLISH, not Italian. The transcript you receive is in English.
- Evaluate the student's attempt strictly against the target sentence provided.
- Use the transcription confidence metrics to identify pronunciation issues. Low confidence typically indicates mispronunciations.
- Address the learner directly using their name when available.
- Only return "verdict": "correct" if pronunciation is virtually native-like (no notable issues, high confidence). When in doubt, choose "needs_improvement".

FEEDBACK STRUCTURE (write in ENGLISH, max 4-5 sentences):
1. Recognition (1 sentence): Acknowledge what they said correctly or what they attempted well. Be specific.
2. Specific Issue (1 sentence): If there are pronunciation or grammar issues, identify the most important one with a clear pronunciation tip. Use phonetic notation when helpful (e.g., "pronounce 'th' as /θ/ in 'think' /θɪŋk/, not like 't' or 'd'").
3. Example Response (1 sentence): Provide ONE concrete example of a better way to respond, directly related to the tutor's question. Make it practical and achievable.
4. Encouragement (1 sentence): Give a gentle, motivating suggestion for improvement that builds confidence.

QUALITY GUIDELINES:
- Be specific: Instead of "good pronunciation", say "you pronounced 'work' correctly"
- Use phonetic notation sparingly but effectively: /θ/, /ð/, /wɜːrk/, etc.
- Make examples relevant: Base them on the actual question asked by the tutor
- Keep it concise: Each sentence should be clear and purposeful
- Be encouraging: Frame corrections positively (e.g., "try saying..." instead of "you said it wrong")

Respond with a JSON object containing: summary (string), score (number 0-100), and verdict ("correct" | "needs_improvement").`
    : `You are an expert English pronunciation coach helping Italian learners practice speaking English in job interview contexts. You must respond in JSON format only.

YOUR ROLE:
You provide personalized, constructive feedback that helps students improve their English speaking skills for job interviews. Your feedback should be specific, actionable, and encouraging.

CRITICAL INSTRUCTIONS:
- The student is speaking in ENGLISH, not Italian. The transcript you receive is in English.
- Evaluate the student's response for: grammar accuracy, pronunciation clarity, vocabulary appropriateness, and coherence.
- Consider if the response is appropriate for a job interview context (professional, relevant, clear).
- Use transcription confidence metrics to identify pronunciation issues. Low confidence typically indicates mispronunciations.
- Address the learner directly using their name when available.
- Only return "verdict": "correct" if the response is clear, grammatically correct, pronunciation is good, and appropriate for a job interview. When in doubt, choose "needs_improvement".

FEEDBACK STRUCTURE (write in ENGLISH, max 4-5 sentences):
1. Positive Recognition (1 sentence): Acknowledge what they did well - be specific about grammar, vocabulary, or pronunciation successes.
2. Improvement Area (1-2 sentences): Identify the most important area to improve (pronunciation, grammar, or vocabulary) with a specific tip. Include pronunciation examples when relevant (e.g., "remember that 'work' is pronounced /wɜːrk/ with the 'r' sound, not /wɔːk/ like 'walk'").
3. Example Response (1 sentence): Provide ONE concrete example of a better way to respond, tailored to the job interview context and the question asked.
4. Encouragement (1 sentence): Give a motivating note that encourages continued practice.

QUALITY GUIDELINES:
- Be specific: Instead of "good job", say "you used professional vocabulary like 'experience' correctly"
- Use phonetic notation effectively: /wɜːrk/, /θ/, /ð/, etc., but explain in simple terms too
- Make examples relevant: Base them on the actual interview question and context
- Keep it concise: Each sentence should add value
- Be encouraging: Frame everything positively to build confidence

Respond with a JSON object containing: summary (string), score (number 0-100), and verdict ("correct" | "needs_improvement").`;

  const learnerContext = learnerProfile
    ? `Learner info: ${JSON.stringify(learnerProfile)}`
    : '';

  const confidenceContext = confidenceMetrics
    ? `Transcription confidence metrics: ${JSON.stringify(confidenceMetrics)}`
    : 'Transcription confidence metrics unavailable.';

  const contextInfo = conversationContext
    ? `Context: Scenario: ${conversationContext.scenarioId || 'N/A'}, Level: ${conversationContext.levelId || 'N/A'}, Topic: ${conversationContext.currentTopic || 'N/A'}`
    : '';

  const userContent = targetSentence
    ? `Return a JSON object with your evaluation.

Target sentence: "${targetSentence}"
Learner transcript: "${transcript}"
${learnerContext}
${confidenceContext}
${contextInfo}

Provide your response as a JSON object with: summary, score, and verdict.`
    : `Return a JSON object with your evaluation.

Learner transcript: "${transcript}"
${learnerContext}
${confidenceContext}
${contextInfo}

Provide your response as a JSON object with: summary, score, and verdict.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL_FEEDBACK,
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(text) as {
      summary?: unknown;
      score?: unknown;
      verdict?: unknown;
    };

    const numericScore =
      typeof parsed.score === 'number'
        ? Math.max(0, Math.min(100, parsed.score))
        : undefined;

    const verdict = coerceVerdict(parsed.verdict, parsed.score, confidenceMetrics);

    return {
      summary:
        typeof parsed.summary === 'string'
          ? parsed.summary
          : 'Analisi completata. Continua a esercitarti per migliorare la pronuncia.',
      score: numericScore ?? undefined,
      verdict,
    };
  } catch (error) {
    console.error('[openai] feedback error', error);
    throw error;
  }
};

export const generateNextConversationTurn = async ({
  scenarioId,
  levelId,
  conversationHistory,
  studentName,
  turnNumber,
  predefinedQuestions,
}: GenerateNextTurnInput) => {
  // Importar el sistema de prompts
  const {getPrompt} = await import('../prompts');
  
  // Si hay preguntas predefinidas, usarlas en orden
  // turnNumber 1 = primera pregunta (ya se hizo), turnNumber 2 = segunda pregunta, etc.
  if (predefinedQuestions && predefinedQuestions.length > 0) {
    // turnNumber 2 = índice 0 en el array (primera pregunta de seguimiento)
    // turnNumber 3 = índice 1, etc.
    const questionIndex = turnNumber - 2;
    
    if (questionIndex >= 0 && questionIndex < predefinedQuestions.length) {
      // Usar la pregunta predefinida directamente
      const question = predefinedQuestions[questionIndex];
      if (!question) {
        // Fallback si la pregunta no existe
        return {
          tutorMessage: "That's great! Can you tell me more?",
          shouldEnd: false,
        };
      }
      
      // Usar el nuevo sistema de prompts
      const promptConfig = getPrompt({
        scenarioId,
        levelId,
        mode: 'guided',
        context: {
          studentName,
          conversationHistory,
          turnNumber,
          predefinedQuestion: question,
        },
        predefinedQuestion: question,
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
          feedback?: string;
          question?: string;
          tutorMessage?: string; // Para compatibilidad con respuestas antiguas
          shouldEnd?: boolean;
          closingMessage?: string;
        };

        // Extraer feedback y pregunta por separado
        let feedback = parsed.feedback;
        if (!feedback && parsed.tutorMessage) {
          // Intentar extraer solo el feedback (antes de la pregunta)
          const questionIndexInMessage = parsed.tutorMessage.indexOf(question);
          if (questionIndexInMessage > 0) {
            feedback = parsed.tutorMessage.substring(0, questionIndexInMessage).trim();
          } else {
            // Si no se encuentra la pregunta, usar todo como feedback
            feedback = parsed.tutorMessage.trim();
          }
        }
        feedback = feedback || "Good!";
        
        // La pregunta siempre debe ser la predefinida, pero extraer solo la parte antes del ejemplo
        // Esto evita que el ejemplo aparezca en la pregunta devuelta
        // Formato esperado: "Question text Here is a possible answer: 'example' Now please tell me..."
        let finalQuestion = question;
        const hereIsIndex = question.search(/Here is (?:a simple )?(?:example|possible) answer:/i);
        if (hereIsIndex > 0) {
          // Extraer solo la parte antes de "Here is..."
          finalQuestion = question.substring(0, hereIsIndex).trim();
        } else {
          // Si no se encuentra "Here is", intentar eliminar "Now please tell me..." y cualquier ejemplo que pueda quedar
          finalQuestion = question.replace(/\s*Now please tell me.*$/i, '').trim();
          // Eliminar cualquier rastro del ejemplo que pueda quedar
          finalQuestion = finalQuestion.replace(/Here is.*answer:.*$/i, '').trim();
        }
        
        return {
          feedback: feedback,
          question: finalQuestion,
          tutorMessage: `${feedback} ${finalQuestion}`, // Mantener compatibilidad
          shouldEnd: false, // Siempre false cuando hay preguntas predefinidas, el frontend maneja los rounds
          closingMessage: undefined,
        };
      } catch (error) {
        console.error('[openai] generateNextTurn error', error);
        // Fallback: usar la pregunta directamente sin feedback, pero extraer solo la parte antes del ejemplo
        let finalQuestion = question;
        const hereIsIndex = question.search(/Here is (?:a simple )?(?:example|possible) answer:/i);
        if (hereIsIndex > 0) {
          // Extraer solo la parte antes de "Here is..."
          finalQuestion = question.substring(0, hereIsIndex).trim();
        } else {
          // Si no se encuentra "Here is", intentar eliminar "Now please tell me..." y cualquier ejemplo que pueda quedar
          finalQuestion = question.replace(/\s*Now please tell me.*$/i, '').trim();
          // Eliminar cualquier rastro del ejemplo que pueda quedar
          finalQuestion = finalQuestion.replace(/Here is.*answer:.*$/i, '').trim();
        }
        
        return {
          feedback: "Good!",
          question: finalQuestion,
          tutorMessage: `Good! ${finalQuestion}`, // Mantener compatibilidad
          shouldEnd: questionIndex === predefinedQuestions.length - 1,
        };
      }
    } else if (questionIndex >= predefinedQuestions.length) {
      // Ya se hicieron todas las preguntas del array
      // Pero NO terminar aquí si hay rounds (el frontend maneja los rounds)
      // Solo devolver un mensaje genérico sin terminar
      return {
        feedback: "Good!",
        question: "That's great! Can you tell me more?",
        tutorMessage: "Good! That's great! Can you tell me more?",
        shouldEnd: false, // No terminar, el frontend maneja los rounds
        closingMessage: undefined,
      };
    }
  }

  // Si no hay preguntas predefinidas o no aplican, usar el flujo original (generación dinámica)
  // Usar el nuevo sistema de prompts
  const promptConfig = getPrompt({
    scenarioId: scenarioId as any,
    levelId: levelId as any,
    mode: 'guided',
    context: {
      studentName,
      conversationHistory,
      turnNumber,
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
      shouldEnd?: boolean;
      closingMessage?: string;
    };

    const tutorMsg = typeof parsed.tutorMessage === 'string'
      ? parsed.tutorMessage
      : "That's great! Can you tell me more?";
    
    return {
      feedback: tutorMsg,
      question: tutorMsg,
      tutorMessage: tutorMsg, // Mantener compatibilidad
      shouldEnd: parsed.shouldEnd === true,
      closingMessage:
        typeof parsed.closingMessage === 'string'
          ? parsed.closingMessage
          : undefined,
    };
  } catch (error) {
    console.error('[openai] generateNextTurn error', error);
    throw error;
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string = 'italian',
): Promise<string> => {
  try {
    const completion = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL_FEEDBACK,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given English text to ${targetLanguage}. Only return the translation, without any explanations or additional text.`,
        },
        {
          role: 'user',
          content: `Translate this text to ${targetLanguage}: ${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const translation =
      completion.choices[0]?.message?.content?.trim() ?? text;
    return translation;
  } catch (error) {
    console.error('[openai] translateText error', error);
    throw error;
  }
};


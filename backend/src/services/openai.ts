import OpenAI from 'openai';
import type {Express} from 'express';
import {toFile} from 'openai/uploads';

const OPENAI_MODEL_FEEDBACK = process.env.OPENAI_FEEDBACK_MODEL ?? 'gpt-4o-mini';
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

FEEDBACK STRUCTURE (write in Italian, max 4-5 sentences):
1. Recognition (1 sentence): Acknowledge what they said correctly or what they attempted well. Be specific.
2. Specific Issue (1 sentence): If there are pronunciation or grammar issues, identify the most important one with a clear pronunciation tip. Use phonetic notation when helpful (e.g., "pronuncia 'th' come /θ/ in 'think' /θɪŋk/, non come 't' o 'd'").
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

FEEDBACK STRUCTURE (write in Italian, max 4-5 sentences):
1. Positive Recognition (1 sentence): Acknowledge what they did well - be specific about grammar, vocabulary, or pronunciation successes.
2. Improvement Area (1-2 sentences): Identify the most important area to improve (pronunciation, grammar, or vocabulary) with a specific tip. Include pronunciation examples when relevant (e.g., "ricorda che 'work' si pronuncia /wɜːrk/ con la 'r', non /wɔːk/ come 'walk'").
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
      // El AI solo genera feedback, no la pregunta
      const systemPrompt = `You are an expert English virtual teacher conducting a job interview simulation. You must respond in JSON format only.

YOUR ROLE:
You are a patient, encouraging English teacher helping Italian learners practice job interviews. You provide constructive feedback that helps students improve their speaking skills.

CRITICAL INSTRUCTIONS:
- The student is speaking in ENGLISH, not Italian. The transcript you receive is in English.
- The next question is already defined and will be asked separately. You ONLY provide feedback, never the question.
- Address the student directly using their name when available.
- Your feedback must be in Italian (the student's native language) so they understand clearly.

FEEDBACK STRUCTURE (3-4 sentences in Italian):
1. Recognition (1 sentence): Acknowledge what they did well - be specific about their answer (e.g., "Hai usato bene la parola 'experience'" or "La tua risposta era chiara e diretta").
2. Specific Suggestion (1 sentence): Provide ONE specific improvement tip. If pronunciation is an issue, include a clear pronunciation guide (e.g., "Prova a pronunciare 'work' come /wɜːrk/ con la 'r' ben marcata" or "Ricorda che 'think' si pronuncia /θɪŋk/ con il suono 'th' /θ/"). If grammar is the issue, give a clear correction example.
3. Example Response (1 sentence): Provide ONE concrete example of a better way to respond, directly related to the question that was asked. Make it practical and achievable for their level.
4. Encouragement (1 sentence): Give a brief, motivating note that encourages them to continue.

QUALITY GUIDELINES:
- Be specific: Name exact words or phrases they used correctly or incorrectly
- Use phonetic notation effectively: /θ/, /ð/, /wɜːrk/, etc., but always explain in simple Italian too
- Make examples relevant: Base them on the actual question that was asked
- Keep it concise: 3-4 sentences maximum, each with clear purpose
- Be encouraging: Always start with what they did well, then suggest improvements positively
- Adapt to their level: Use simpler language for beginners, slightly more complex for intermediate

Remember: You must always respond with valid JSON only.`;

      const historyText = conversationHistory
        .map(msg => `${msg.role === 'tutor' ? 'Tutor' : msg.role === 'user' ? 'Student' : 'Feedback'}: ${msg.text}`)
        .join('\n');

      const userPrompt = `The student just answered your previous question. 

Conversation history so far:
${historyText}

The question that was asked: [Find the last tutor question in the conversation history]

The student's answer: [Find the last student/user message in the conversation history]

Now you need to:
1. Analyze their answer carefully - what did they say correctly? What needs improvement?
2. Provide helpful feedback in Italian (3-4 sentences) following this structure:
   - Recognition: What they did well (be specific about words, phrases, or pronunciation)
   - Specific Suggestion: ONE clear improvement tip with pronunciation guide if needed (use phonetic notation like /θ/, /wɜːrk/)
   - Example Response: ONE concrete example of a better way to respond, based on the question that was asked
   - Encouragement: A brief, motivating note

3. The next question is already defined and will be asked separately: "${question}"

IMPORTANT: 
- Only provide feedback in Italian. Do NOT include the question in your response.
- Be specific: Instead of "good job", say exactly what was good (e.g., "Hai pronunciato correttamente 'experience'")
- Make pronunciation tips clear: Use phonetic notation AND explain in Italian (e.g., "pronuncia 'think' /θɪŋk/ con il suono 'th' /θ/ come quando soffi")
- Make examples relevant: Base them on the actual question that was asked

Return a JSON object with this structure:
{
  "feedback": "string - Your helpful feedback in Italian (3-4 sentences, no question)",
  "question": "string - The predefined question exactly as provided: ${question}",
  "shouldEnd": false
}`;

      try {
        const completion = await openaiClient.chat.completions.create({
          model: OPENAI_MODEL_FEEDBACK,
          response_format: {type: 'json_object'},
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
        // Si el AI devolvió feedback separado, usarlo; si no, intentar extraerlo del tutorMessage
        let feedback = parsed.feedback;
        if (!feedback && parsed.tutorMessage) {
          // Intentar extraer solo el feedback (antes de la pregunta)
          const questionIndex = parsed.tutorMessage.indexOf(question);
          if (questionIndex > 0) {
            feedback = parsed.tutorMessage.substring(0, questionIndex).trim();
          } else {
            // Si no se encuentra la pregunta, usar todo como feedback
            feedback = parsed.tutorMessage.trim();
          }
        }
        feedback = feedback || "Good!";
        
        // La pregunta siempre debe ser la predefinida, no la del AI
        const finalQuestion = question;

        // Verificar si es la última pregunta
        const isLastQuestion = questionIndex === predefinedQuestions.length - 1;
        
        return {
          feedback: feedback,
          question: finalQuestion,
          tutorMessage: `${feedback} ${finalQuestion}`, // Mantener compatibilidad
          shouldEnd: isLastQuestion,
          closingMessage: isLastQuestion 
            ? `Thank you for the interview, ${studentName}. You did great! Keep practicing.`
            : undefined,
        };
      } catch (error) {
        console.error('[openai] generateNextTurn error', error);
        // Fallback: usar la pregunta directamente sin feedback
        return {
          feedback: "Good!",
          question: question,
          tutorMessage: `Good! ${question}`, // Mantener compatibilidad
          shouldEnd: questionIndex === predefinedQuestions.length - 1,
        };
      }
    } else if (questionIndex >= predefinedQuestions.length) {
      // Ya se hicieron todas las preguntas, terminar
      const closingMsg = `Thank you for the interview, ${studentName}. You did great! Keep practicing.`;
      return {
        feedback: closingMsg,
        question: closingMsg,
        tutorMessage: closingMsg, // Mantener compatibilidad
        shouldEnd: true,
        closingMessage: closingMsg,
      };
    }
  }

  // Si no hay preguntas predefinidas o no aplican, usar el flujo original (generación dinámica)
  const systemPrompt = `You are an expert English virtual teacher conducting a job interview simulation. You must respond in JSON format only.

YOUR ROLE:
You are a patient, encouraging English teacher helping Italian learners practice job interviews. You conduct natural conversations while providing constructive feedback.

CRITICAL INSTRUCTIONS:
- The student is speaking in ENGLISH, not Italian. The transcript you receive is in English.
- Speak in simple, clear English at a moderate pace.
- Ask one question at a time and wait completely for the student's response.
- After each student response, provide feedback in Italian that includes:
  * Recognition of what they did well (be specific about words, phrases, or pronunciation)
  * ONE specific improvement suggestion with pronunciation tips when needed (use phonetic notation like /θ/, /wɜːrk/)
  * ONE concrete example of a better response, based on the question you asked
  * An encouraging note
- Keep feedback concise (3-4 sentences in Italian) but helpful and specific.
- Maintain a motivating, patient, and friendly tone.
- Adapt your suggestions based on what the student says and their level.

FEEDBACK QUALITY GUIDELINES:
- Be specific: Instead of "good job", say exactly what was good (e.g., "Hai pronunciato correttamente 'experience'")
- Use phonetic notation effectively: /θ/, /ð/, /wɜːrk/, etc., but always explain in simple Italian too
- Make examples relevant: Base them on the actual question you asked
- Keep it concise: 3-4 sentences maximum, each with clear purpose
- Be encouraging: Always start with what they did well, then suggest improvements positively
- Adapt to their level: Use simpler language for beginners, slightly more complex for intermediate

Remember: You must always respond with valid JSON only.`;

  // Construir el historial de conversación para el contexto
  const historyText = conversationHistory
    .map(msg => `${msg.role === 'tutor' ? 'Tutor' : msg.role === 'user' ? 'Student' : 'Feedback'}: ${msg.text}`)
    .join('\n');

  const userPrompt = `You are conducting a job interview in English with a beginner-level student named ${studentName}.

Current turn number: ${turnNumber}

Conversation history so far:
${historyText}

Based on the conversation history, generate the NEXT question or response from the tutor.

IMPORTANT INSTRUCTIONS:
- If this is turn 1 and there's no greeting yet, start with: "Hello, ${studentName}. Nice to see you today. Tell me about yourself. Here is a simple example answer: 'I am a positive person. I like working with people. I learn fast, and I enjoy doing a good job.' Now please tell me about yourself."
- If the student just answered, you need to:
  1. Provide feedback in Italian (3-4 sentences) following this structure:
     * Recognition: What they did well (be specific about words, phrases, or pronunciation - e.g., "Hai pronunciato correttamente 'experience'" or "Hai usato bene la struttura 'I like...'")
     * Specific Suggestion: ONE clear improvement tip with pronunciation guide if needed (use phonetic notation like /θ/, /wɜːrk/ and explain in Italian - e.g., "Prova a pronunciare 'think' /θɪŋk/ con il suono 'th' /θ/ come quando soffi")
     * Example Response: ONE concrete example of a better way to respond, directly related to the question you asked (e.g., if you asked "Tell me about yourself", provide an example like "Potresti dire: 'I am a hard worker and I enjoy learning new things'")
     * Encouragement: A brief, motivating note (e.g., "Continua così, stai migliorando!")
  2. Then ask the next natural follow-up question in English
- Keep questions simple and appropriate for beginner level.
- After 4-5 questions, you can start wrapping up the interview.
- If it's time to end (after 4-5 questions), provide a closing message like: "Thank you for the interview, ${studentName}. You did great! Keep practicing."

FEEDBACK QUALITY REQUIREMENTS:
- Be specific: Name exact words or phrases they used correctly or incorrectly
- Include pronunciation tips with phonetic notation when relevant, but always explain in simple Italian too
- Make examples relevant: Base them on the actual question you asked in the conversation
- Keep feedback concise: 3-4 sentences maximum, each with clear purpose
- Be encouraging: Always start with what they did well, then suggest improvements positively

You must respond ONLY with valid JSON. Do not include any text before or after the JSON.

Return a JSON object with this structure:
{
  "tutorMessage": "string - The feedback in Italian followed by the next question in English, or just the question if it's the first turn",
  "shouldEnd": boolean - true if the conversation should end,
  "closingMessage": "string - Optional closing message if shouldEnd is true"
}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL_FEEDBACK,
      response_format: {type: 'json_object'},
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


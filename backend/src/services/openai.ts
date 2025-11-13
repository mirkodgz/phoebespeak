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
  targetSentence: string;
  learnerProfile?: {
    nativeLanguage?: string;
    proficiencyLevel?: string;
    learnerName?: string;
  };
  transcriptionSegments?: TranscriptSegment[];
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
}: GeneratePracticeFeedbackInput) => {

  const confidenceMetrics = computeConfidenceMetrics(transcriptionSegments);

  const prompt = `Act as an English pronunciation coach for Italian learners.
- Evaluate the student's attempt strictly against the target sentence.
- Use the provided transcription confidence metrics to infer pronunciation quality. Low confidence usually signals mispronunciations.
- Address the learner directly using their name when available in the learner info.
- Only return "verdict": "correct" if pronunciation is virtually native-like (no notable issues, confidence high). When in doubt, choose "needs_improvement".
- Provide a concise summary in Italian (max deux frasi), highlighting key pronunciation observations.
- Avoid bullet lists or phoneme tables.

Respond strictly in JSON with the following structure:
{
  "summary": string,
  "score": number (0-100),
  "verdict": "correct" | "needs_improvement"
}`;

  const learnerContext = learnerProfile
    ? `Learner info: ${JSON.stringify(learnerProfile)}`
    : '';

  const confidenceContext = confidenceMetrics
    ? `Transcription confidence metrics: ${JSON.stringify(confidenceMetrics)}`
    : 'Transcription confidence metrics unavailable.';

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
          content: `Target sentence: "${targetSentence}"\nLearner transcript: "${transcript}"\n${learnerContext}\n${confidenceContext}`,
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


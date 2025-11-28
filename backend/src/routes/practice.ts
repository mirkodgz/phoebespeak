import {Router} from 'express';
import multer from 'multer';

import {
  generatePracticeFeedback,
  generateNextConversationTurn,
  transcribeAudio,
  translateText,
} from '../services/openai';
import {generateFreeInterviewTurn} from '../services/openailiberainterview';
import {generateTutorChatResponse} from '../services/openaiTutorChat';
import {synthesizeSpeech} from '../services/elevenlabs';

const upload = multer({storage: multer.memoryStorage()});

const router = Router();

router.post('/transcribe', upload.single('audio'), async (req, res, next) => {
  try {
    console.info('[practice] /transcribe called');
    if (!req.file) {
      return res.status(400).json({error: 'Audio file is required'});
    }

    const transcript = await transcribeAudio(req.file);
    console.info('[practice] /transcribe success');
    res.json(transcript);
  } catch (error) {
    console.error('[practice] /transcribe error', error);
    next(error);
  }
});

router.post('/feedback', async (req, res, next) => {
  try {
    console.info('[practice] /feedback called');
    const {
      transcript,
      targetSentence,
      learnerProfile,
      transcriptionSegments,
      conversationContext,
    } = req.body ?? {};

    if (!transcript) {
      return res.status(400).json({error: 'transcript is required'});
    }

    const feedback = await generatePracticeFeedback({
      transcript,
      targetSentence,
      learnerProfile,
      transcriptionSegments,
      conversationContext,
    });

    console.info('[practice] /feedback success');
    res.json(feedback);
  } catch (error) {
    console.error('[practice] /feedback error', error);
    next(error);
  }
});

router.post('/generate-next-turn', async (req, res, next) => {
  try {
    console.info('[practice] /generate-next-turn called');
    const {
      scenarioId,
      levelId,
      conversationHistory,
      studentName,
      turnNumber,
      predefinedQuestions,
    } = req.body ?? {};

    if (!scenarioId || !levelId || !conversationHistory || !studentName) {
      return res.status(400).json({
        error:
          'scenarioId, levelId, conversationHistory, and studentName are required',
      });
    }

    const nextTurn = await generateNextConversationTurn({
      scenarioId,
      levelId,
      conversationHistory,
      studentName,
      turnNumber: turnNumber ?? 1,
      predefinedQuestions,
    });

    console.info('[practice] /generate-next-turn success');
    res.json(nextTurn);
  } catch (error) {
    console.error('[practice] /generate-next-turn error', error);
    next(error);
  }
});

router.post('/voice', async (req, res, next) => {
  try {
    console.info('[practice] /voice called');
    const {text, voiceId, tutorId} = req.body ?? {};

    if (!text) {
      return res.status(400).json({error: 'text is required'});
    }

    // Si se proporciona tutorId, mapearlo a voiceId
    let finalVoiceId = voiceId;
    if (tutorId && !voiceId) {
      // Mapeo de tutorId a voiceId desde variables de entorno
      if (tutorId === 'davide') {
        finalVoiceId = process.env.ELEVENLABS_VOICE_ID_DAVIDE || process.env.ELEVENLABS_VOICE_ID;
        console.info(`[practice] /voice - Tutor: Víctor (davide), VoiceId: ${finalVoiceId ? 'configured' : 'NOT SET'}`);
      } else if (tutorId === 'phoebe') {
        finalVoiceId = process.env.ELEVENLABS_VOICE_ID_PHOEBE || process.env.ELEVENLABS_VOICE_ID;
        console.info(`[practice] /voice - Tutor: Ace (phoebe), VoiceId: ${finalVoiceId ? 'configured' : 'NOT SET'}`);
      }
    } else if (voiceId) {
      console.info(`[practice] /voice - Using explicit voiceId: ${voiceId.substring(0, 10)}...`);
    } else {
      console.info(`[practice] /voice - Using default ELEVENLABS_VOICE_ID: ${process.env.ELEVENLABS_VOICE_ID ? 'configured' : 'NOT SET'}`);
      finalVoiceId = process.env.ELEVENLABS_VOICE_ID;
    }

    const audioBuffer = await synthesizeSpeech(text, finalVoiceId);

    res.setHeader('Content-Type', 'audio/mpeg');
    console.info('[practice] /voice success');
    res.send(audioBuffer);
  } catch (error) {
    console.error('[practice] /voice error', error);
    next(error);
  }
});

router.post('/translate', async (req, res, next) => {
  try {
    console.info('[practice] /translate called');
    const {text, targetLanguage} = req.body ?? {};

    if (!text) {
      return res.status(400).json({error: 'text is required'});
    }

    const translation = await translateText(text, targetLanguage ?? 'italian');

    console.info('[practice] /translate success');
    res.json({translation});
  } catch (error) {
    console.error('[practice] /translate error', error);
    next(error);
  }
});

router.post('/generate-free-interview-turn', async (req, res, next) => {
  try {
    console.info('[practice] /generate-free-interview-turn called');
    const {
      conversationHistory,
      studentName,
      turnNumber,
      companyName,
      positionName,
      scenarioId,
      levelId,
    } = req.body ?? {};

    if (!conversationHistory || !studentName || !turnNumber) {
      return res.status(400).json({
        error: 'conversationHistory, studentName, and turnNumber are required',
      });
    }

    const nextTurn = await generateFreeInterviewTurn({
      conversationHistory,
      studentName,
      turnNumber,
      companyName,
      positionName,
      scenarioId: scenarioId || 'jobInterview',
      levelId: levelId || 'beginner',
    });

    console.info('[practice] /generate-free-interview-turn success');
    res.json(nextTurn);
  } catch (error) {
    console.error('[practice] /generate-free-interview-turn error', error);
    next(error);
  }
});

router.post('/tutor-chat', async (req, res, next) => {
  try {
    console.info('[practice] /tutor-chat called');
    const {
      conversationHistory,
      studentName,
      studentLevel,
      message,
    } = req.body ?? {};

    if (!message || !studentName) {
      return res.status(400).json({
        error: 'message and studentName are required',
      });
    }

    const response = await generateTutorChatResponse({
      conversationHistory: conversationHistory || [],
      studentName,
      studentLevel: studentLevel || 'beginner',
      message,
    });

    console.info('[practice] /tutor-chat success');
    res.json(response);
  } catch (error) {
    console.error('[practice] /tutor-chat error', error);
    next(error);
  }
});

export default router;


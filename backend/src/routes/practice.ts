import {Router} from 'express';
import multer from 'multer';

import {generatePracticeFeedback, transcribeAudio} from '../services/openai';
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
    } = req.body ?? {};

    if (!transcript || !targetSentence) {
      return res
        .status(400)
        .json({error: 'transcript and targetSentence are required'});
    }

    const feedback = await generatePracticeFeedback({
      transcript,
      targetSentence,
      learnerProfile,
      transcriptionSegments,
    });

    console.info('[practice] /feedback success');
    res.json(feedback);
  } catch (error) {
    console.error('[practice] /feedback error', error);
    next(error);
  }
});

router.post('/voice', async (req, res, next) => {
  try {
    console.info('[practice] /voice called');
    const {text} = req.body ?? {};

    if (!text) {
      return res.status(400).json({error: 'text is required'});
    }

    const audioBuffer = await synthesizeSpeech(text);

    res.setHeader('Content-Type', 'audio/mpeg');
    console.info('[practice] /voice success');
    res.send(audioBuffer);
  } catch (error) {
    console.error('[practice] /voice error', error);
    next(error);
  }
});

export default router;


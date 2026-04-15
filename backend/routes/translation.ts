import express, { Request, Response, Router } from 'express';
import { translateChunked } from '../services/translationService';

const router: Router = express.Router();

/**
 * POST /api/translate
 * Translate text to a target language
 * Body: { text: string, targetLanguage: string }
 * Response: { translatedText: string }
 */
router.post('/translate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      res.status(400).json({
        error: 'Missing required fields: text, targetLanguage',
      });
      return;
    }

    // Increased limit to 50000 characters as backend handles chunking
    if (text.length > 50000) {
      res.status(400).json({
        error: 'Text too long. Maximum 50000 characters allowed.',
      });
      return;
    }

    console.log(`[Translation] Translating ${text.length} chars to ${targetLanguage}`);
    const translatedText = await translateChunked(text, targetLanguage);

    console.log(`[Translation] Completed. Result: ${translatedText.length} chars`);
    res.json({
      translatedText,
      originalText: text,
      targetLanguage,
    });
  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: (error as Error).message,
    });
  }
});

export default router;

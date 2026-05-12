import express, { Request, Response, Router } from 'express';
import { translateChunked } from '../services/translationService';

const router: Router = express.Router();
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z]{2,8})?$/i;

/**
 * POST /api/translate
 * Translate text to a target language
 * Body: { text: string, targetLanguage: string }
 * Response: { translatedText: string }
 */
router.post('/translate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLanguage } = req.body;

    if (typeof text !== 'string' || typeof targetLanguage !== 'string') {
      res.status(400).json({
        error: 'Invalid payload. text and targetLanguage must be strings.',
      });
      return;
    }

    const normalizedTargetLanguage = targetLanguage.trim().toLowerCase();

    if (text.trim().length === 0 || !normalizedTargetLanguage) {
      res.status(400).json({
        error: 'Missing required fields: text, targetLanguage',
      });
      return;
    }

    if (!LANGUAGE_CODE_PATTERN.test(normalizedTargetLanguage)) {
      res.status(400).json({
        error: 'Invalid targetLanguage format. Expected ISO language code (e.g., en, es, zh-cn).',
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

    console.log(`[Translation] Translating ${text.length} chars to ${normalizedTargetLanguage}`);
    const translatedText = await translateChunked(text, normalizedTargetLanguage);

    console.log(`[Translation] Completed. Result: ${translatedText.length} chars`);
    res.json({
      translatedText,
      originalText: text,
      targetLanguage: normalizedTargetLanguage,
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

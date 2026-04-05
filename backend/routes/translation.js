const express = require('express');
const router = express.Router();
const { translateChunked } = require('../services/translationService');

/**
 * POST /api/translate
 * Translate text to a target language
 * Body: { text: string, targetLanguage: string }
 * Response: { translatedText: string }
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: 'Missing required fields: text, targetLanguage',
      });
    }

    // Increased limit to 50000 characters as backend handles chunking
    if (text.length > 50000) {
      return res.status(400).json({
        error: 'Text too long. Maximum 50000 characters allowed.',
      });
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
      message: error.message,
    });
  }
});

module.exports = router;

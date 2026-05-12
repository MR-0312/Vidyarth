/**
 * Translate text to a target language using MyMemory API
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'es', 'fr', 'de')
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
  const normalizedTargetLanguage = targetLanguage.trim().toLowerCase();

  if (!text || normalizedTargetLanguage === 'en') {
    return text;
  }

  try {
    // Map language codes to MyMemory format if needed
    const langMap: Record<string, string> = {
      'es': 'es-ES',
      'fr': 'fr-FR', 
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'hi': 'hi-IN',
      'ar': 'ar-SA',
    };

    const targetLang = langMap[normalizedTargetLanguage] || normalizedTargetLanguage;
    const encodedText = encodeURIComponent(text);
    const encodedTargetLang = encodeURIComponent(targetLang);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${encodedTargetLang}`;

    console.log(`[MyMemory] Translating: "${text.substring(0, 50)}..." to ${targetLanguage} (${targetLang})`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.statusText}`);
    }

    const result = await response.json() as any;
    
    if (result.responseStatus === 200) {
      console.log(`[MyMemory] Success: "${result.responseData.translatedText.substring(0, 50)}..."`);
      return result.responseData.translatedText || text;
    } else {
      console.error(`[MyMemory] Error status ${result.responseStatus}: ${result.responseDetails}`);
      return text;
    }
  } catch (error) {
    console.error(`[MyMemory] Translation error for language ${targetLanguage}:`, (error as Error).message);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Translate text in chunks to handle large texts
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {number} chunkSize - Size of each chunk (default: 300)
 * @returns {Promise<string>} - Translated text
 */
async function translateChunked(text: string, targetLanguage: string, chunkSize: number = 300): Promise<string> {
  const normalizedTargetLanguage = targetLanguage.trim().toLowerCase();

  if (!text || normalizedTargetLanguage === 'en') {
    return text;
  }

  try {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    console.log(`[Translation] Chunked translation: ${chunks.length} chunks of max ${chunkSize} chars`);
    
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      try {
        const translated = await translateText(chunk, normalizedTargetLanguage);
        translatedChunks.push(translated);
        // Add small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error('Chunk translation error:', err);
        translatedChunks.push(chunk); // Return original if translation fails
      }
    }

    return translatedChunks.join('');
  } catch (error) {
    console.error('Chunked translation error:', error);
    return text;
  }
}

export { translateText, translateChunked };

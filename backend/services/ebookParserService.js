const unzipper = require('unzipper');
const xml2js = require('xml2js');
const { Readable } = require('stream');

// HTML sanitizer to clean extracted content
const htmlSanitizer = (html) => {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')    // Remove styles
    .substring(0, 100000); // Limit to prevent huge entries
};

/**
 * Extract plain text content from HTML
 */
function extractTextFromHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
    .trim()
    .substring(0, 50000); // Limit content
}

/**
 * Extract content from XHTML file
 */
async function extractContentFromXhtml(buffer) {
  try {
    if (!buffer) return '';
    const content = buffer.toString('utf-8');
    const textContent = extractTextFromHtml(content);
    return textContent;
  } catch (err) {
    console.error('Error extracting XHTML content:', err);
    return '';
  }
}

/**
 * Parse EPUB file and extract chapters
 * @param {Buffer} epubBuffer - The EPUB file as a buffer
 * @returns {Promise<Array>} - Array of chapters with { number, title, start_page, end_page }
 */
async function parseEpubChapters(epubBuffer) {
  try {
    const chapters = [];
    const xmlParser = new xml2js.Parser({ ignoreAttrs: false });
    
    // Extract all files from the EPUB (which is a ZIP)
    const entries = {};
    const readable = Readable.from(epubBuffer);
    
    await new Promise((resolve, reject) => {
      readable
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          try {
            const chunks = [];
            entry.on('data', chunk => chunks.push(chunk));
            entry.on('end', () => {
              entries[entry.path] = Buffer.concat(chunks);
            });
            entry.on('error', reject);
          } catch (err) {
            reject(err);
          }
        })
        .on('close', resolve)
        .on('error', reject);
    });

    // Find and parse container.xml to get the root file
    const containerBuffer = entries['META-INF/container.xml'];
    if (!containerBuffer) {
      console.warn('No container.xml found in EPUB');
      return generateDefaultChapters(50);
    }

    let contentOpfPath = null;
    try {
      const containerData = await xmlParser.parseStringPromise(containerBuffer);
      contentOpfPath = containerData?.container?.rootfiles?.[0]?.rootfile?.[0]?.$?.['full-path'];
    } catch (err) {
      console.warn('Error parsing container.xml:', err);
      return generateDefaultChapters(50);
    }

    if (!contentOpfPath || !entries[contentOpfPath]) {
      console.warn('Could not find OPF file');
      return generateDefaultChapters(50);
    }

    // Parse the OPF file (package.opf or similar)
    let opfData;
    try {
      opfData = await xmlParser.parseStringPromise(entries[contentOpfPath]);
    } catch (err) {
      console.warn('Error parsing OPF file:', err);
      return generateDefaultChapters(50);
    }

    const spine = opfData?.package?.spine?.[0]?.itemref || [];
    const manifest = opfData?.package?.manifest?.[0]?.item || [];

    // Build a map of IDs to hrefs
    const idToHref = {};
    manifest.forEach(item => {
      const id = item.$?.id;
      const href = item.$?.href;
      if (id && href) {
        idToHref[id] = href;
      }
    });

    // Try to find NCX file for table of contents
    let ncxPath = null;
    manifest.forEach(item => {
      if (item.$?.['media-type'] === 'application/x-dtbncx+xml') {
        ncxPath = item.$?.href;
      }
    });

    // Parse NCX for table of contents
    if (ncxPath) {
      const basePath = contentOpfPath.substring(0, contentOpfPath.lastIndexOf('/') + 1);
      const fullNcxPath = (basePath + ncxPath).replace(/\/\//g, '/');
      
      if (entries[fullNcxPath]) {
        try {
          const ncxData = await xmlParser.parseStringPromise(entries[fullNcxPath]);
          const navPoints = ncxData?.ncx?.navMap?.[0]?.navPoint || [];
          
          const extractedChapters = await extractChaptersFromNavPoints(navPoints, 1, basePath, idToHref, entries);
          if (extractedChapters.length > 0) {
            return extractedChapters;
          }
        } catch (err) {
          console.warn('Error parsing NCX file:', err);
        }
      }
    }

    // Fallback: extract chapters from spine order
    let chapterNumber = 1;
    const basePath = contentOpfPath.substring(0, contentOpfPath.lastIndexOf('/') + 1);
    
    for (const item of spine) {
      const idref = item.$?.idref;
      if (idref && idToHref[idref]) {
        const href = idToHref[idref];
        const fullPath = (basePath + href).replace(/\/\//g, '/');
        const fileName = href.split('/').pop();
        const title = `Chapter ${chapterNumber}`;
        
        // Try to extract content from the chapter file
        let content = '';
        if (entries[fullPath]) {
          try {
            content = await extractContentFromXhtml(entries[fullPath]);
          } catch (err) {
            console.error(`Error extracting content for chapter ${chapterNumber}:`, err);
          }
        }
        
        chapters.push({
          chapter_number: chapterNumber,
          title: cleanTitle(title),
          start_page: null,
          end_page: null,
          content: content || null
        });
        
        chapterNumber++;
      }
    }

    return chapters.length > 0 ? chapters : generateDefaultChapters(50);
  } catch (error) {
    console.error('Error parsing EPUB:', error);
    return generateDefaultChapters(50);
  }
}

/**
 * Recursively extract chapters from NCX navPoints with content extraction
 */
async function extractChaptersFromNavPoints(navPoints, startNumber = 1, basePath = '', idToHref = {}, entries = {}) {
  const chapters = [];
  let chapterNumber = startNumber;

  for (const point of navPoints) {
    let title = point?.navLabel?.[0]?.text?.[0] || `Chapter ${chapterNumber}`;
    
    // Remove duplications BEFORE processing
    // Handle patterns like "Chapter 1 Chapter 1" or "Chapter 1: Chapter 1:"
    title = title.replace(/^(.+?)\s+\1\s*$/, '$1'); // Remove full duplication
    title = title.replace(/^(Chapter|Part|Section|Act|Book)\s+(\d+)[\s:]*\1\s+\2/i, '$1 $2'); // Remove pattern duplication
    
    // Only add if it looks like a chapter, not just book parts
    if (shouldIncludeAsChapter(title)) {
      // Extract content from the chapter's content file
      let content = null;
      try {
        const content_src = point?.content?.[0]?.$?.src;
        if (content_src) {
          const fullContentPath = (basePath + content_src).replace(/\/\//g, '/');
          if (entries[fullContentPath]) {
            content = await extractContentFromXhtml(entries[fullContentPath]);
          }
        }
      } catch (err) {
        console.error(`Error extracting content for chapter "${title}":`, err);
      }
      
      chapters.push({
        chapter_number: chapterNumber,
        title: cleanTitle(title),
        start_page: null,
        end_page: null,
        content: content || null
      });
      chapterNumber++;
    }

    // Recursively process child navPoints
    if (point.navPoint && point.navPoint.length > 0) {
      const childChapters = await extractChaptersFromNavPoints(point.navPoint, chapterNumber, basePath, idToHref, entries);
      chapters.push(...childChapters);
      chapterNumber += childChapters.length;
    }
  }

  return chapters;
}

/**
 * Determine if a section should be included as a chapter
 */
function shouldIncludeAsChapter(title) {
  const lowerTitle = title.toLowerCase();
  
  // Exclude certain patterns
  const excludePatterns = ['cover', 'title page', 'copyright', 'foreword', 'introduction(?!.*chapter)', 'table of contents', 'index', 'notes', 'appendix'];
  if (excludePatterns.some(pattern => new RegExp(pattern, 'i').test(lowerTitle))) {
    return false;
  }

  // Include if it contains chapter-related keywords
  const includePatterns = ['chapter', 'part', 'section', 'act', 'book', 'canto', 'stanza'];
  return includePatterns.some(pattern => new RegExp(pattern, 'i').test(lowerTitle)) || title.match(/^\d+\.?\s+/);
}

/**
 * Clean and format title - removes duplicates and standardizes format
 */
function cleanTitle(title) {
  if (!title) return '';
  
  let cleaned = title.trim();
  
  // Remove duplicate patterns like "Chapter 1: Chapter 1:"
  // Match pattern: Word Number: Word Number
  cleaned = cleaned.replace(/^(Chapter|Part|Section|Act|Book)\s+(\d+)[\s:]*\1\s+\2\s*:?\s*/i, '$1 $2: ');
  
  // If that didn't work, try to handle "Chapter 1: Chapter 1" (no final colon)
  if (cleaned === title.trim()) {
    cleaned = cleaned.replace(/^(Chapter|Part|Section|Act|Book)\s+(\d+)[\s:]*\1\s+\2\s*/i, '$1 $2: ');
  }
  
  // If still no match, apply standard formatting to ensure consistency
  if (cleaned === title.trim()) {
    cleaned = cleaned
      .replace(/^(Chapter|Part|Section|Act|Book)\s*(\d+)[\s:]+/i, '$1 $2: ')
      .replace(/:(.*):/, ': $1'); // Clean up any ":: something :"
  }
  
  // Remove any remaining multiple colons or spaces
  cleaned = cleaned
    .replace(/:\s*:\s*/g, ': ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Ensure proper format at the end
  if (!cleaned.endsWith(':') && cleaned.match(/^(Chapter|Part|Section|Act|Book)\s+\d+/i)) {
    // Already has number, don't add colon
  }
  
  return cleaned.substring(0, 255);
}

/**
 * Generate default chapters for books without detectable TOC
 */
function generateDefaultChapters(estimatedPageCount) {
  const chapters = [];
  const chaptersPerBook = Math.max(5, Math.ceil(estimatedPageCount / 20));
  const pagesPerChapter = Math.floor(estimatedPageCount / chaptersPerBook);

  for (let i = 1; i <= chaptersPerBook; i++) {
    chapters.push({
      chapter_number: i,
      title: `Chapter ${i}`,
      start_page: (i - 1) * pagesPerChapter + 1,
      end_page: i === chaptersPerBook ? estimatedPageCount : i * pagesPerChapter,
      content: null
    });
  }

  return chapters;
}

/**
 * Parse MOBI/AZW3 - Basic support
 * For MOBI and AZW3, we can only generate default chapters
 * as full parsing requires more complex libraries
 */
async function parseMobiChapters(mobiBuffer) {
  try {
    // Try to extract basic info from MOBI header
    // This is simplified - full MOBI parsing is complex
    const estimatedPages = Math.ceil(mobiBuffer.length / 3000); // Rough estimate
    return generateDefaultChapters(estimatedPages);
  } catch (error) {
    console.error('Error parsing MOBI:', error);
    return generateDefaultChapters(50);
  }
}

/**
 * Parse AZW3 - Basic support
 * Similar to MOBI, AZW3 is based on KF8 format
 */
async function parseAzw3Chapters(azw3Buffer) {
  try {
    // AZW3 is more similar to EPUB structure
    // Try basic parsing similar to EPUB
    const estimatedPages = Math.ceil(azw3Buffer.length / 3000);
    return generateDefaultChapters(estimatedPages);
  } catch (error) {
    console.error('Error parsing AZW3:', error);
    return generateDefaultChapters(50);
  }
}

/**
 * Main entry point - parse chapters based on file format
 */
async function parseChapters(fileBuffer, fileFormat) {
  if (!fileBuffer) {
    return generateDefaultChapters(50);
  }

  switch (fileFormat.toLowerCase()) {
    case 'epub':
      return await parseEpubChapters(fileBuffer);
    case 'mobi':
      return await parseMobiChapters(fileBuffer);
    case 'azw3':
      return await parseAzw3Chapters(fileBuffer);
    default:
      return generateDefaultChapters(50);
  }
}

module.exports = {
  parseChapters,
  parseEpubChapters,
  parseMobiChapters,
  parseAzw3Chapters,
  generateDefaultChapters
};

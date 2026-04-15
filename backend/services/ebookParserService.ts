import { Readable } from 'stream';
import unzipper from 'unzipper';
import xml2js from 'xml2js';

interface Chapter {
  chapter_number: number;
  title: string;
  start_page: number | null;
  end_page: number | null;
  content?: string | null;
}

const xmlParser = new xml2js.Parser({ ignoreAttrs: false });

/**
 * Extract plain text content from HTML
 */
function extractTextFromHtml(html: string): string {
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
 * Generate default chapters
 */
function generateDefaultChapters(estimatedPages: number): Chapter[] {
  const chapters: Chapter[] = [];
  const pagePerChapter = 20;
  const chapterCount = Math.max(1, Math.floor(estimatedPages / pagePerChapter));
  
  for (let i = 1; i <= chapterCount; i++) {
    chapters.push({
      chapter_number: i,
      title: `Chapter ${i}`,
      start_page: (i - 1) * pagePerChapter + 1,
      end_page: i * pagePerChapter
    });
  }
  
  return chapters;
}

/**
 * Parse EPUB file and extract chapters with content
 * @param {Buffer} epubBuffer - The EPUB file as a buffer
 * @returns {Promise<Array>} - Array of chapters with { number, title, start_page, end_page, content }
 */
async function parseEpubChapters(epubBuffer: Buffer): Promise<Chapter[]> {
  try {
    const chapters: Chapter[] = [];
    
    // Extract all files from the EPUB (which is a ZIP)
    const entries: Record<string, Buffer> = {};
    const readable = Readable.from(epubBuffer);
    
    await new Promise((resolve, reject) => {
      readable
        .pipe(unzipper.Parse())
        .on('entry', async (entry: any) => {
          try {
            const chunks: Buffer[] = [];
            entry.on('data', (chunk: Buffer) => chunks.push(chunk));
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

    let contentOpfPath: string | null = null;
    try {
      const containerData = await xmlParser.parseStringPromise(containerBuffer) as any;
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
    let opfData: any;
    try {
      opfData = await xmlParser.parseStringPromise(entries[contentOpfPath]) as any;
    } catch (err) {
      console.warn('Error parsing OPF file:', err);
      return generateDefaultChapters(50);
    }

    const spine = opfData?.package?.spine?.[0]?.itemref || [];
    const manifest = opfData?.package?.manifest?.[0]?.item || [];

    // Build a map of IDs to hrefs
    const idToHref: Record<string, string> = {};
    manifest.forEach((item: any) => {
      const id = item.$?.id;
      const href = item.$?.href;
      if (id && href) {
        idToHref[id] = href;
      }
    });

    // Fallback: extract chapters from spine order
    let chapterNumber = 1;
    const basePath = contentOpfPath.substring(0, contentOpfPath.lastIndexOf('/') + 1);
    
    for (const item of spine) {
      const idref = item.$?.idref;
      if (idref && idToHref[idref]) {
        const href = idToHref[idref];
        const fullPath = (basePath + href).replace(/\/\//g, '/');
        const title = `Chapter ${chapterNumber}`;
        
        // Try to extract content from the chapter file
        let content = '';
        if (entries[fullPath]) {
          try {
            content = extractTextFromHtml(entries[fullPath].toString('utf-8'));
          } catch (err) {
            console.error(`Error extracting content for chapter ${chapterNumber}:`, err);
          }
        }
        
        chapters.push({
          chapter_number: chapterNumber,
          title: title,
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
 * Parse chapters from any supported ebook format
 */
async function parseChapters(fileBuffer: Buffer, fileFormat: string): Promise<Chapter[]> {
  try {
    switch (fileFormat.toLowerCase()) {
      case 'epub':
        return await parseEpubChapters(fileBuffer);
      case 'mobi':
      case 'azw3':
        // For MOBI and AZW3, return default chapters
        return generateDefaultChapters(150);
      default:
        return generateDefaultChapters(50);
    }
  } catch (error) {
    console.error('Error parsing chapters:', error);
    return generateDefaultChapters(50);
  }
}

export { parseChapters, parseEpubChapters, generateDefaultChapters };

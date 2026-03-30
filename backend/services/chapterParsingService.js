const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const unzipper = require('unzipper');
const xml2js = require('xml2js');

const xmlParser = new xml2js.Parser();

/**
 * Parse EPUB file and extract chapters
 * @param {Buffer} fileBuffer - The EPUB file buffer
 * @returns {Promise<Array>} Array of chapters with structure: { chapter_number, title, start_page, end_page }
 */
async function parseEPUB(fileBuffer) {
  try {
    const chapters = [];
    let chapterCount = 1;

    // Create a readable stream from buffer
    const stream = Readable.from(fileBuffer);

    // Extract EPUB (which is a ZIP file)
    const entries = {};
    await new Promise((resolve, reject) => {
      stream
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
          const fileName = entry.path;
          entries[fileName] = entry;
          
          if (fileName.endsWith('.opf') || fileName.endsWith('.ncx')) {
            entry.autodrain();
          } else {
            entry.autodrain();
          }
        })
        .on('error', reject)
        .on('end', resolve);
    });

    // Try to read package.opf for table of contents
    const packageOPFPath = Object.keys(entries).find(f => f.endsWith('package.opf') || f.endsWith('.opf'));
    if (packageOPFPath) {
      const opfContent = await readEntryContent(fileBuffer, packageOPFPath);
      const parsedOPF = await xmlParser.parseStringPromise(opfContent);

      // Extract spine and manifest
      const manifest = parsedOPF?.package?.manifest?.[0]?.item || [];
      const spine = parsedOPF?.package?.spine?.[0]?.itemref || [];

      // Build chapters from manifest and spine
      const spineIds = spine.map(ref => ref['$'].idref);
      const manifestMap = {};
      manifest.forEach(item => {
        manifestMap[item['$'].id] = {
          href: item['$'].href,
          mediaType: item['$']['media-type']
        };
      });

      // Create chapters from spine items
      let pageCount = 1;
      spineIds.forEach((id, index) => {
        const item = manifestMap[id];
        if (item && (item.mediaType.includes('html') || item.mediaType.includes('xhtml'))) {
          const title = `Chapter ${chapterCount}`;
          const startPage = pageCount;
          pageCount += 15; // Estimate ~15 pages per chapter

          chapters.push({
            chapter_number: chapterCount,
            title: title,
            start_page: startPage,
            end_page: pageCount - 1
          });

          chapterCount++;
        }
      });
    }

    // Try to read NCX (TocFile) for better chapter titles
    const ncxPath = Object.keys(entries).find(f => f.endsWith('.ncx'));
    if (ncxPath && chapters.length > 0) {
      const ncxContent = await readEntryContent(fileBuffer, ncxPath);
      const parsedNCX = await xmlParser.parseStringPromise(ncxContent);
      
      const navPoints = parsedNCX?.ncx?.navMap?.[0]?.navPoint || [];
      navPoints.forEach((navPoint, index) => {
        if (chapters[index]) {
          const navLabel = navPoint?.navLabel?.[0]?.text?.[0];
          if (navLabel) {
            chapters[index].title = navLabel;
          }
        }
      });
    }

    // If no chapters found via OPF/NCX, create default chapters based on content
    if (chapters.length === 0) {
      chapters.push({
        chapter_number: 1,
        title: 'Full Content',
        start_page: 1,
        end_page: 100
      });
    }

    return chapters;
  } catch (error) {
    console.error('Error parsing EPUB:', error);
    // Return a default chapter if parsing fails
    return [
      {
        chapter_number: 1,
        title: 'Full Content',
        start_page: 1,
        end_page: 100
      }
    ];
  }
}

/**
 * Parse MOBI file - basic implementation
 * MOBI files are complex; we'll create default chapters
 * @param {Buffer} fileBuffer - The MOBI file buffer
 * @returns {Promise<Array>} Array of chapters
 */
async function parseMOBI(fileBuffer) {
  try {
    // MOBI parsing is complex without external libraries
    // Return estimated chapters
    return [
      {
        chapter_number: 1,
        title: 'Full Content',
        start_page: 1,
        end_page: 150
      }
    ];
  } catch (error) {
    console.error('Error parsing MOBI:', error);
    return [
      {
        chapter_number: 1,
        title: 'Full Content',
        start_page: 1,
        end_page: 150
      }
    ];
  }
}

/**
 * Parse AZW3 file - basic implementation
 * AZW3 is similar to EPUB but with DRM
 * @param {Buffer} fileBuffer - The AZW3 file buffer
 * @returns {Promise<Array>} Array of chapters
 */
async function parseAZW3(fileBuffer) {
  try {
    // Try to parse as EPUB-like structure
    return await parseEPUB(fileBuffer);
  } catch (error) {
    console.error('Error parsing AZW3:', error);
    return [
      {
        chapter_number: 1,
        title: 'Full Content',
        start_page: 1,
        end_page: 150
      }
    ];
  }
}

/**
 * Read content from a ZIP entry
 * @param {Buffer} zipBuffer - The ZIP file buffer
 * @param {string} entryPath - Path within the ZIP
 * @returns {Promise<string>} Content of the entry
 */
function readEntryContent(zipBuffer, entryPath) {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(zipBuffer);
    let found = false;

    stream
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        if (entry.path === entryPath) {
          found = true;
          entry.pipe(fs.createWriteStream(path.join('/tmp', 'temp_entry')))
            .on('finish', () => {
              const content = fs.readFileSync(path.join('/tmp', 'temp_entry'), 'utf-8');
              resolve(content);
            })
            .on('error', reject);
        } else {
          entry.autodrain();
        }
      })
      .on('error', reject)
      .on('end', () => {
        if (!found) reject(new Error(`Entry ${entryPath} not found`));
      });
  });
}

/**
 * Main function to parse book and extract chapters
 * @param {Buffer} fileBuffer - The ebook file buffer
 * @param {string} fileFormat - Format: 'epub', 'mobi', or 'azw3'
 * @returns {Promise<Array>} Array of chapters
 */
async function parseBook(fileBuffer, fileFormat) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Invalid file buffer');
    }

    switch (fileFormat.toLowerCase()) {
      case 'epub':
        return await parseEPUB(fileBuffer);
      case 'mobi':
        return await parseMOBI(fileBuffer);
      case 'azw3':
        return await parseAZW3(fileBuffer);
      default:
        throw new Error(`Unsupported format: ${fileFormat}`);
    }
  } catch (error) {
    console.error(`Error parsing ${fileFormat} file:`, error);
    // Return default chapter structure
    return [
      {
        chapter_number: 1,
        title: 'Full Content',
        start_page: 1,
        end_page: 100
      }
    ];
  }
}

module.exports = {
  parseBook,
  parseEPUB,
  parseMOBI,
  parseAZW3
};

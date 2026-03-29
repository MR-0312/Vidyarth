const { supabase } = require('../db/queries');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Upload file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} fileType - 'cover' or 'ebook'
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
async function uploadFile(fileBuffer, fileName, fileType) {
  if (!fileBuffer) {
    throw new Error('No file buffer provided');
  }

  const fileExt = path.extname(fileName).toLowerCase();
  const uniqueFileName = `${fileType}-${uuidv4()}${fileExt}`;
  const bucketName = fileType === 'cover' ? 'book-covers' : 'ebooks';

  try {
    // First, verify the bucket exists
    const { data: allBuckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      throw new Error(`Cannot access Supabase storage: ${listError.message}`);
    }
    
    const bucketExists = allBuckets && allBuckets.some(b => b.name === bucketName);
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucketName}' not found. Please ensure your Supabase project is properly configured with both 'book-covers' and 'ebooks' buckets.`);
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: getContentType(fileExt)
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    return urlData.publicUrl;
  } catch (error) {
    throw new Error(`Supabase storage upload error: ${error.message}`);
  }
}

/**
 * Delete file from Supabase Storage
 * @param {string} fileUrl - Public URL of the file
 * @param {string} fileType - 'cover' or 'ebook'
 */
async function deleteFile(fileUrl, fileType) {
  if (!fileUrl) return;

  const bucketName = fileType === 'cover' ? 'book-covers' : 'ebooks';
  
  try {
    // Extract file name from URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error && error.statusCode !== 404) {
      console.error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    console.error(`Supabase storage delete error: ${error.message}`);
  }
}

/**
 * Get content type based on file extension
 * @param {string} ext - File extension (e.g., '.epub', '.mobi', '.azw3')
 * @returns {string} - MIME type
 */
function getContentType(ext) {
  const mimeTypes = {
    '.epub': 'application/epub+zip',
    '.mobi': 'application/x-mobipocket-ebook',
    '.azw3': 'application/vnd.amazon.ebook',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Ensure Supabase Storage buckets exist
 * Creates 'book-covers' and 'ebooks' buckets if they don't exist
 */
async function ensureBucketsExist() {
  const buckets = ['book-covers', 'ebooks'];

  for (const bucketName of buckets) {
    try {
      // List buckets to verify
      const { data: allBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`Error listing buckets:`, listError);
        continue;
      }

      const bucketExists = allBuckets && allBuckets.some(b => b.name === bucketName);

      if (!bucketExists) {
        console.log(`Bucket ${bucketName} not found, creating...`);
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*', 'application/epub+zip', 'application/x-mobipocket-ebook', 'application/vnd.amazon.ebook']
        });
        
        if (createError) {
          if (createError.statusCode === 409) {
            console.log(`Bucket ${bucketName} already exists`);
          } else {
            console.error(`Failed to create bucket ${bucketName}:`, createError.message);
          }
        } else {
          console.log(`✓ Bucket ${bucketName} created successfully`);
        }
      } else {
        console.log(`✓ Bucket ${bucketName} already exists`);
      }
    } catch (err) {
      console.error(`Error verifying bucket ${bucketName}:`, err.message);
    }
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getContentType,
  ensureBucketsExist
};

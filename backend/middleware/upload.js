const multer = require('multer');

// Use memory storage to handle files temporarily before uploading to Supabase
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for Supabase
  fileFilter: function (req, file, cb) {
    if (file.fieldname === "cover") {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
    } else if (file.fieldname === "ebook") {
      if (!file.originalname.match(/\.(pdf|epub)$/i)) {
        return cb(new Error('Only PDF and EPUB files are allowed!'), false);
      }
    }
    cb(null, true);
  }
});

module.exports = upload;
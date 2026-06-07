const multer = require('multer');

// Configure memory storage to retrieve file buffer directly without writing to disk
const storage = multer.memoryStorage();

// File filter to restrict uploads to PDF and Text documents
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'text/plain'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF or TXT files are supported.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum upload limit
  }
});

module.exports = upload;

const multer = require("multer");

// Use memory storage to keep files in buffer for B2 upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = upload;

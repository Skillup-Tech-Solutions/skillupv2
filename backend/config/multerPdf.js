const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const name = path.parse(file.originalname).name.replace(/\s+/g, "-");
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype === 'application/pdf';

  if (mime && allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

const uploadPdf = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

module.exports = uploadPdf;
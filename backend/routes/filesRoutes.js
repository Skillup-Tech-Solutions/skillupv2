const express = require("express");
const { downloadProxy } = require("../controllers/filesController");
const router = express.Router();

// GET /api/files/download?file=...
router.get("/download", downloadProxy);

module.exports = router;

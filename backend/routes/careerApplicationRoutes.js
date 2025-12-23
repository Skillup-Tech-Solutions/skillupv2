const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Use global memory storage
const { careerApplicationSubmission, careerApplicationWithAttachment } = require('../controllers/careerApplicationController');

/**
 * @swagger
 * /api/career-mail:
 *   post:
 *     summary: Submit a career application with resume attachment
 *     tags: 
 *        - Career Applications
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Candidate's full name
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *         description: Candidate's email address
 *       - in: formData
 *         name: mobile
 *         type: string
 *         required: true
 *         description: Candidate's mobile number
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: Job title/position applying for
 *       - in: formData
 *         name: resume
 *         type: file
 *         required: true
 *         description: Resume file (PDF, DOC, DOCX - max 10MB)
 *     responses:
 *       200:
 *         description: Career application with attachment sent successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/career-mail', upload.single('resume'), careerApplicationWithAttachment);

module.exports = router;
const express = require('express');
const router = express.Router();
const {createCareeers, updateCareers, deleteCareers,getCareers,updateCareersstatus} = require("../controllers/careeersController");
const authMiddleware = require('../middleware/auth');
/**
 * @swagger
 * /api/careers:
 *   post:
 *     summary: Create a new careers
 *     tags: 
 *        - Careers  
 */
router.post("/careers",authMiddleware, createCareeers);
router.put("/careers/:id",authMiddleware, updateCareers);
router.delete("/careers/:id",authMiddleware, deleteCareers);
router.get("/careers", getCareers);
router.put("/careersstatus/:id",authMiddleware,updateCareersstatus);

module.exports = router;
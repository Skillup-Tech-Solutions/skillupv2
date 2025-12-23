const express = require("express");
const router = express.Router();
const {
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
} = require("../controllers/offerController");
const auth = require("../middleware/auth");
/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Create a new offer
 *     tags: 
 *        - Offers   
 */
router.post("/offers",auth, createOffer);        
router.get("/offers", getOffers);    
router.put("/offers/:id",auth, updateOffer);  
router.delete("/offers/:id",auth, deleteOffer);  

module.exports = router;

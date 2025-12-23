const express = require('express');
const router = express.Router();
const {createCategory, updateCategory, deleteCategory,getCategory} = require("../controllers/CategoryController");
const authMiddleware = require('../middleware/auth');
const upload = require("../config/multer");
/**
 * @swagger
 * /api/Category:
 *   post:
 *     summary: Create a new Category
 *     tags: 
 *        - Category  
 */
router.post("/category", authMiddleware, upload.single("image"), createCategory); 
router.put("/category/:id", authMiddleware, upload.single("image"), updateCategory);
router.delete("/category/:id", authMiddleware, deleteCategory);
router.get("/category", getCategory);  //GET /api/category?type=workShop//  /GET /api/category?type=internShip

module.exports = router;
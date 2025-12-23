const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Public route for fetching payment instructions used by students/clients
router.get("/settings", paymentController.getPublicSettings);

module.exports = router;

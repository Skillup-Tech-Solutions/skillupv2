const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleAuth");
const payrollController = require("../controllers/payrollController");

router.use(auth);
router.use(adminOnly);

router.post("/generate", payrollController.generatePayslip);
router.get("/history", payrollController.getAllPayslips);
router.get("/download/:id", payrollController.downloadPayslip);
router.post("/send-email", payrollController.sendPayslipEmail);

// Settings
router.get("/settings", payrollController.getSettings);
router.put("/settings", payrollController.updateSettings);

module.exports = router;

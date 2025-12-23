const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const employeePortalController = require("../controllers/employeePortalController");

router.use(auth);
// No role check needed specifically, as long as they are authenticated. 
// Controller checks if they have an employee profile linked.

router.get("/my-payslips", employeePortalController.getMyPayslips);
router.get("/download/:id", employeePortalController.downloadPayslip);

module.exports = router;

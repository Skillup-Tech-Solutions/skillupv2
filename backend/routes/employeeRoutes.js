const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleAuth");
const employeeController = require("../controllers/employeeController");

router.use(auth);
router.use(adminOnly);

router.post("/", employeeController.createEmployee);
router.get("/", employeeController.getAllEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.put("/:id", employeeController.updateEmployeeProfile);

// Salary specific
router.post("/:employeeProfileId/salary", employeeController.updateSalaryStructure);

module.exports = router;

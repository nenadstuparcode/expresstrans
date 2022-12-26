const express = require("express");
const DriverController = require("../controllers/DriverController");

const router = express.Router();

router.post("/search", DriverController.driverSearch);
router.get("/", DriverController.driverList);
router.get("/:id", DriverController.driverDetail);
router.post("/", DriverController.driverStore);
router.put("/:id", DriverController.driverUpdate);
router.delete("/:id", DriverController.driverDelete);

module.exports = router;
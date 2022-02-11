var express = require("express");
const VehicleController = require("../controllers/VehicleController");

var router = express.Router();

router.get("/", VehicleController.vehicleList);
router.get("/:id", VehicleController.vehicleDetail);
router.post("/", VehicleController.vehicleStore);
router.put("/:id", VehicleController.vehicleUpdate);
router.delete("/:id", VehicleController.vehicleDelete);

module.exports = router;
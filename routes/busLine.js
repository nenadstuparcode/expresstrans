var express = require("express");
const BusLineController = require("../controllers/BusLineController");

var router = express.Router();

router.get("/", BusLineController.busLineList);
router.get("/:id", BusLineController.busLineDetail);
router.post("/", BusLineController.busLineStore);
router.put("/:id", BusLineController.busLineUpdate);
router.delete("/:id", BusLineController.busLineDelete);
router.post("/search", BusLineController.busLineSearch);

module.exports = router;

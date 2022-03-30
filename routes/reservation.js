var express = require("express");
const ReservationController = require("../controllers/ReservationController");

var router = express.Router();

router.get("/", ReservationController.reservationList);
router.get("/:id", ReservationController.reservationDetail);
router.post("/", ReservationController.reservationStore);
router.put("/:id", ReservationController.reservationUpdate);
router.delete("/:id", ReservationController.reservationDelete);
router.post("/search", ReservationController.reservationSearch);
router.post("/search-date/", ReservationController.reservationsSearchDate);

module.exports = router;

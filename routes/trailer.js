const express = require("express");
const TrailerController = require("../controllers/TrailerController");

const router = express.Router();

router.post("/search", TrailerController.trailerSearch);
router.get("/", TrailerController.trailerList);
router.get("/:id", TrailerController.trailerDetail);
router.post("/", TrailerController.trailerStore);
router.put("/:id", TrailerController.trailerUpdate);
router.delete("/:id", TrailerController.trailerDelete);

module.exports = router;
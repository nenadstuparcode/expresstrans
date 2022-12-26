const express = require("express");
const RelationController = require("../controllers/RelationController");

const router = express.Router();

router.post("/search", RelationController.relationSearch);
router.get("/", RelationController.relationsList);
router.get("/:id", RelationController.relationDetail);
router.post("/", RelationController.relationStore);
router.put("/:id", RelationController.relationUpdate);
router.delete("/:id", RelationController.relationDelete);

module.exports = router;
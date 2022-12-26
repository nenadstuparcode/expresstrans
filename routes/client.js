const express = require("express");
const ClientController = require("../controllers/ClientController");

var router = express.Router();

router.get("/", ClientController.clientList);
router.get("/:id", ClientController.clientDetail);
router.post("/", ClientController.clientStore);
router.put("/:id", ClientController.clientUpdate);
router.delete("/:id", ClientController.clientDelete);
router.post("/search", ClientController.clientSearch);

module.exports = router;
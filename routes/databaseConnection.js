const express = require("express");
const DatabaseConnectionController = require("../controllers/DatabaseConnectionController");

var router = express.Router();

router.get("/list", DatabaseConnectionController.dbList);
router.get("/connect/:name", DatabaseConnectionController.dbConnect);
router.get("/current", DatabaseConnectionController.dbCurrent);
router.get("/useDb/:name", DatabaseConnectionController.dbUse);

module.exports = router;
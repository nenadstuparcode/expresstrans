const express = require("express");
const CounterController = require("../controllers/CounterController");

var router = express.Router();

router.get("/", CounterController.counterList);

module.exports = router;
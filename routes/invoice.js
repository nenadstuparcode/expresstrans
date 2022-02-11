var express = require("express");
const InvoiceController = require("../controllers/InvoiceController");

var router = express.Router();

router.get("/", InvoiceController.invoiceList);
router.get("/:id", InvoiceController.invoiceDetail);
router.post("/", InvoiceController.invoiceStore);
router.put("/:id", InvoiceController.invoiceUpdate);
router.delete("/:id", InvoiceController.invoiceDelete);
router.post("/search", InvoiceController.invoiceSearch);

module.exports = router;

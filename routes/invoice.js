var express = require("express");
const InvoiceController = require("../controllers/InvoiceController");

var router = express.Router();

router.get("/", InvoiceController.invoiceList);
router.get("/:id", InvoiceController.invoiceDetail);
router.post("/", InvoiceController.invoiceStore);
router.put("/:id", InvoiceController.invoiceUpdate);
router.put("/expenses/:id", InvoiceController.invoiceUpdateExp);
router.put("/tax/:id", InvoiceController.invoiceUpdateTax);
router.delete("/:id", InvoiceController.invoiceDelete);
router.post("/search", InvoiceController.invoiceSearch);
router.post("/print-tax", InvoiceController.invoicePrintTax);

module.exports = router;

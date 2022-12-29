const express = require("express");
const InvoiceController = require("../controllers/InvoiceController");
const router = express.Router();

router.get("/", InvoiceController.invoiceList);
router.get("/:id", InvoiceController.invoiceDetail);
router.post("/", InvoiceController.invoiceStore);
router.put("/:id", InvoiceController.invoiceUpdate);
router.put("/expenses/:id", InvoiceController.invoiceUpdateExp);
router.put("/tax/:id", InvoiceController.invoiceUpdateTax);
router.delete("/:id", InvoiceController.invoiceDelete);
router.post("/search", InvoiceController.invoiceSearch);
router.post("/search/v2", InvoiceController.invoiceSearchV2);
router.post("/print-tax", InvoiceController.invoicePrintTax);
router.post("/print-pdf", InvoiceController.invoicePdfPrint);
router.post("/report-by-clients", InvoiceController.invoiceReportByClients);
router.post("/report-not-paid", InvoiceController.invoiceReportNotPaid);
router.post("/report-all", InvoiceController.invoiceReportAllInvoices);
router.post("/report-months", InvoiceController.invoiceReportByMonth);

module.exports = router;

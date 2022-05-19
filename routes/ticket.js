var express = require("express");
const TicketController = require("../controllers/TicketController");

var router = express.Router();
router.post("/email", TicketController.sendToMail);
router.post("/print", TicketController.ticketPrint);
router.get("/", TicketController.ticketList);
router.get("/:id", TicketController.ticketDetail);
router.post("/", TicketController.ticketStore);
router.put("/:id", TicketController.ticketUpdate);
router.delete("/:id", TicketController.ticketDelete);
router.post("/search", TicketController.ticketSearch);
router.post("/email/:email", TicketController.sendToMailCustom);
router.get("/scan/:ticketId", TicketController.ticketQRCode);
router.post("/report", TicketController.reportSearch);
router.post("/report-print", TicketController.ticketReportClassic);
router.post("/invoice", TicketController.ticketByInvoiceId);
router.post("/ticket-type", TicketController.ticketsSearchDate);


module.exports = router;

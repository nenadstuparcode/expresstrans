var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var busLineRouter = require("./busLine");
var ticketRouter = require("./ticket");
var driverRouter = require("./driver");
var vehicleRouter = require("./vehicle");
var invoiceRouter = require("./invoice");
var reservationRouter = require("./reservation");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/busLine/", busLineRouter);
app.use("/ticket/", ticketRouter);
app.use("/driver/", driverRouter);
app.use("/vehicle/", vehicleRouter);
app.use("/invoice/", invoiceRouter);
app.use("/reservation/", reservationRouter);

module.exports = app;

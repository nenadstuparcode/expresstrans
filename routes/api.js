const express = require("express");
const authRouter = require("./auth");
const busLineRouter = require("./busLine");
const ticketRouter = require("./ticket");
const driverRouter = require("./driver");
const vehicleRouter = require("./vehicle");
const invoiceRouter = require("./invoice");
const reservationRouter = require("./reservation");
const clientRouter = require("./client");
const trailerRouter = require("./trailer");
const counterRouter = require("./counter");
const relationRouter = require("./relation");
const databaseConnectionRouter = require("./databaseConnection");

const app = express();

app.use("/auth/", authRouter);
app.use("/busLine/", busLineRouter);
app.use("/ticket/", ticketRouter);
app.use("/driver/", driverRouter);
app.use("/vehicle/", vehicleRouter);
app.use("/invoice/", invoiceRouter);
app.use("/reservation/", reservationRouter);
app.use("/client/", clientRouter);
app.use("/trailer/", trailerRouter);
app.use("/counter/", counterRouter);
app.use("/relation/", relationRouter);
app.use("/db/", databaseConnectionRouter);

module.exports = app;

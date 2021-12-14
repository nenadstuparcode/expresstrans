var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var busLineRouter = require("./busLine");
var ticketRouter = require("./ticket");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/busLine/", busLineRouter);
app.use("/ticket/", ticketRouter);

module.exports = app;

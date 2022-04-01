var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ReservationSchema = new Schema({
	reservationOnName: { type: String, required: true },
	reservationPhone: { type: String },
	reservationDate: { type: Date, required: true },
	reservationTime: { type: Date, required: true },
	reservationNote: { type: String },
	ticketBusLineId: { type: String, required: true },
}, {timestamps: true});

module.exports = mongoose.model("Reservation", ReservationSchema);
